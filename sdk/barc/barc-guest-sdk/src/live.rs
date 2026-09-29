use super::{PreviewPolicy, MAX_OUTPUT_BYTES, MAX_SELECTION, MAX_SESSION_BYTES, Position3};

const MAX_IDENTITY_BYTES: usize = 64;
const MAX_BASIS_BYTES: usize = 512;
const MAX_PENDING_INPUTS: usize = 8;

#[derive(Clone, Copy, Default, PartialEq, Eq)]
pub struct UnitReference { pub id: u64, pub lifetime: u64 }

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum MovePolicy { Replace = 1, Append = 2 }

#[derive(Clone, Copy)]
enum Action {
    Stop,
    Move { position: Position3, policy: MovePolicy },
    Attack { target: UnitReference },
}

struct LiveRequest {
    input_id: [u8; MAX_IDENTITY_BYTES], input_id_len: usize,
    session: [u8; MAX_SESSION_BYTES], session_len: usize,
    module_generation: u64,
    basis: [u8; MAX_BASIS_BYTES], basis_len: usize,
    input: LiveInput,
    scratch: [UnitReference; MAX_SELECTION],
}

#[derive(Clone, Copy)]
enum LiveInput {
    Initialize { session: [u8; MAX_SESSION_BYTES], session_len: usize, module_generation: u64 },
    Observation { refs: [UnitReference; MAX_SELECTION], kinds: [u8; MAX_SELECTION], count: usize, basis: [u8; MAX_BASIS_BYTES], basis_len: usize },
    Result { input_id: [u8; MAX_IDENTITY_BYTES], input_id_len: usize, module_generation: u64, basis: [u8; MAX_BASIS_BYTES], basis_len: usize },
    Select { actors: [UnitReference; MAX_SELECTION], count: usize },
    Action { actors: [UnitReference; MAX_SELECTION], count: usize, action: Action },
}

pub struct LiveGuestState {
    session: [u8; MAX_SESSION_BYTES], session_len: usize,
    module_generation: u64,
    basis: [u8; MAX_BASIS_BYTES], basis_len: usize,
    observed: [UnitReference; MAX_SELECTION], kinds: [u8; MAX_SELECTION], observed_count: usize,
    selected: [UnitReference; MAX_SELECTION], selected_count: usize,
    pending_ids: [[u8; MAX_IDENTITY_BYTES]; MAX_PENDING_INPUTS], pending_id_lengths: [usize; MAX_PENDING_INPUTS],
    pending_bases: [[u8; MAX_BASIS_BYTES]; MAX_PENDING_INPUTS], pending_basis_lengths: [usize; MAX_PENDING_INPUTS], pending_next: usize,
    output: [u8; MAX_OUTPUT_BYTES],
}

impl LiveGuestState {
    pub const fn new() -> Self {
        const EMPTY: UnitReference = UnitReference { id: 0, lifetime: 0 };
        Self {
            session: [0; MAX_SESSION_BYTES], session_len: 0, module_generation: 0,
            basis: [0; MAX_BASIS_BYTES], basis_len: 0,
            observed: [EMPTY; MAX_SELECTION], kinds: [0; MAX_SELECTION], observed_count: 0,
            selected: [EMPTY; MAX_SELECTION], selected_count: 0,
            pending_ids: [[0; MAX_IDENTITY_BYTES]; MAX_PENDING_INPUTS], pending_id_lengths: [0; MAX_PENDING_INPUTS],
            pending_bases: [[0; MAX_BASIS_BYTES]; MAX_PENDING_INPUTS], pending_basis_lengths: [0; MAX_PENDING_INPUTS], pending_next: 0,
            output: [0; MAX_OUTPUT_BYTES],
        }
    }

    pub fn reset(&mut self) {
        self.session_len = 0; self.module_generation = 0; self.basis_len = 0;
        self.observed_count = 0; self.selected_count = 0; self.pending_id_lengths = [0; MAX_PENDING_INPUTS]; self.pending_basis_lengths = [0; MAX_PENDING_INPUTS]; self.pending_next = 0;
    }

    pub fn initialize(&mut self, bytes: &[u8]) -> Result<&[u8], i32> {
        let request = decode_request(bytes).ok_or(20)?;
        let LiveInput::Initialize { session, session_len, module_generation } = request.input else { return Err(20); };
        if request.session_len == 0 || request.module_generation == 0 || request.basis_len == 0
            || session_len != request.session_len || session[..session_len] != request.session[..request.session_len]
            || module_generation != request.module_generation { return Err(20); }
        self.reset();
        self.session[..request.session_len].copy_from_slice(&request.session[..request.session_len]);
        self.session_len = request.session_len;
        self.module_generation = request.module_generation;
        self.set_basis(&request.basis[..request.basis_len]);
        let length = encode_response(&mut self.output, &request, None).ok_or(24)?;
        Ok(&self.output[..length])
    }

    pub fn process<P: PreviewPolicy>(&mut self, bytes: &[u8]) -> Result<&[u8], i32> {
        let mut request = decode_request(bytes).ok_or(21)?;
        if self.session_len == 0
            || request.session[..request.session_len] != self.session[..self.session_len]
            || request.session_len != self.session_len
            || request.module_generation != self.module_generation { return Err(22); }

        let input = request.input;
        let intent = match input {
            LiveInput::Initialize { .. } => return Err(21),
            LiveInput::Observation { refs, kinds, count, basis, basis_len } => {
                if basis_len != request.basis_len || basis[..basis_len] != request.basis[..request.basis_len] { return Err(23); }
                self.observed[..count].copy_from_slice(&refs[..count]);
                self.kinds[..count].copy_from_slice(&kinds[..count]);
                self.observed_count = count;
                self.set_basis(&request.basis[..request.basis_len]);
                self.retain_selection::<P>();
                None
            }
            LiveInput::Result { input_id, input_id_len, module_generation, basis, basis_len } => {
                if input_id_len != request.input_id_len || input_id[..input_id_len] != request.input_id[..request.input_id_len]
                    || module_generation != request.module_generation || basis_len != request.basis_len
                    || basis[..basis_len] != request.basis[..request.basis_len]
                    || !self.has_pending(&input_id[..input_id_len], &basis[..basis_len]) { return Err(23); }
                None
            }
            LiveInput::Select { actors, count } => {
                if !self.same_basis(&request.basis[..request.basis_len]) { return Err(23); }
                self.selected_count = 0;
                for actor in actors[..count].iter().copied() {
                    if self.is_observed(actor, 1) && P::retain_live_actor(actor.id, actor.lifetime) {
                        self.selected[self.selected_count] = actor; self.selected_count += 1;
                    }
                }
                None
            }
            LiveInput::Action { actors, count, action } => {
                if !self.same_basis(&request.basis[..request.basis_len]) { return Err(23); }
                let mut retained = 0;
                for actor in actors[..count].iter().copied() {
                    if self.is_selected(actor) && self.is_observed(actor, 1)
                        && P::retain_live_actor(actor.id, actor.lifetime) {
                        request_action_actor(&mut request, retained, actor);
                        retained += 1;
                    }
                }
                if retained == 0 { None } else {
                    let transformed = match action {
                        Action::Move { position, policy } => Action::Move { position, policy: P::live_move_policy(policy) },
                        other => other,
                    };
                    if let Action::Attack { target } = transformed {
                        if !self.is_observed(target, 2) || actors[..count].contains(&target) { return Err(23); }
                    }
                    Some((request.action_actors(), retained, transformed))
                }
            }
        };
        if intent.is_some() { self.record_pending(&request.input_id[..request.input_id_len], &request.basis[..request.basis_len]); }
        let length = encode_response(&mut self.output, &request, intent).ok_or(24)?;
        Ok(&self.output[..length])
    }

    fn set_basis(&mut self, value: &[u8]) { self.basis[..value.len()].copy_from_slice(value); self.basis_len = value.len(); }
    fn same_basis(&self, value: &[u8]) -> bool { value == &self.basis[..self.basis_len] }
    fn is_observed(&self, reference: UnitReference, kind: u8) -> bool {
        self.observed[..self.observed_count].iter().enumerate().any(|(i, r)| *r == reference && self.kinds[i] == kind)
    }
    fn is_selected(&self, reference: UnitReference) -> bool { self.selected[..self.selected_count].contains(&reference) }
    fn retain_selection<P: PreviewPolicy>(&mut self) {
        let mut retained = 0;
        for index in 0..self.selected_count {
            let actor = self.selected[index];
            if self.is_observed(actor, 1) && P::retain_live_actor(actor.id, actor.lifetime) {
                self.selected[retained] = actor; retained += 1;
            }
        }
        self.selected_count = retained;
    }
    fn record_pending(&mut self, input_id: &[u8], basis: &[u8]) {
        let index = self.pending_next % MAX_PENDING_INPUTS;
        self.pending_ids[index][..input_id.len()].copy_from_slice(input_id); self.pending_id_lengths[index] = input_id.len();
        self.pending_bases[index][..basis.len()].copy_from_slice(basis); self.pending_basis_lengths[index] = basis.len();
        self.pending_next = self.pending_next.wrapping_add(1);
    }
    fn has_pending(&self, input_id: &[u8], basis: &[u8]) -> bool {
        (0..MAX_PENDING_INPUTS).any(|index| self.pending_id_lengths[index] == input_id.len()
            && self.pending_basis_lengths[index] == basis.len()
            && self.pending_ids[index][..input_id.len()] == *input_id
            && self.pending_bases[index][..basis.len()] == *basis)
    }
}

// Scratch actor storage belongs to the decoded request so response generation
// never borrows host/UI state or invents an identity.
impl LiveRequest {
    fn action_actors(&self) -> &[UnitReference] { &self.scratch[..] }
}

// Kept outside the public SDK shape; every request has fixed bounded storage.
// This field is initialized by decode_request and filled only after validation.
// (Rust does not permit an out-of-line field, so it is declared via this alias.)

pub fn is_live_request(bytes: &[u8]) -> bool { bytes.first().copied() == Some(0x0a) }

struct Reader<'a> { bytes: &'a [u8], at: usize }
impl<'a> Reader<'a> {
    fn new(bytes: &'a [u8]) -> Self { Self { bytes, at: 0 } }
    fn done(&self) -> bool { self.at == self.bytes.len() }
    fn byte(&mut self) -> Option<u8> { let v = *self.bytes.get(self.at)?; self.at += 1; Some(v) }
    fn varint(&mut self) -> Option<u64> { let mut v=0; for s in (0..=63).step_by(7) { let b=self.byte()?; if s==63&&b>1{return None} v|=u64::from(b&127)<<s; if b&128==0{return Some(v)} } None }
    fn blob(&mut self) -> Option<&'a [u8]> { let n=usize::try_from(self.varint()?).ok()?; let end=self.at.checked_add(n)?; let v=self.bytes.get(self.at..end)?; self.at=end; Some(v) }
    fn f32(&mut self) -> Option<f32> { let end=self.at.checked_add(4)?; let v=f32::from_le_bytes(self.bytes.get(self.at..end)?.try_into().ok()?); self.at=end; v.is_finite().then_some(v) }
    fn skip(&mut self,w:u8)->Option<()> { match w {0=>{self.varint()?;},1=>self.at=self.at.checked_add(8)?,2=>{self.blob()?;},5=>self.at=self.at.checked_add(4)?,_=>return None}; (self.at<=self.bytes.len()).then_some(()) }
}

fn copy<const N: usize>(source: &[u8]) -> Option<([u8; N], usize)> { if source.is_empty()||source.len()>N{return None} let mut out=[0;N]; out[..source.len()].copy_from_slice(source); Some((out,source.len())) }

fn decode_request(bytes: &[u8]) -> Option<LiveRequest> {
    let mut r=Reader::new(bytes); let mut input_id=None; let mut session=None; let mut generation=0; let mut basis=None; let mut input=None;
    while !r.done() { let key=r.varint()?; match (key>>3,(key&7)as u8) {
        (1,2)=>input_id=Some(copy::<MAX_IDENTITY_BYTES>(r.blob()?)?), (2,2)=>session=Some(copy::<MAX_SESSION_BYTES>(r.blob()?)?),
        (3,0)=>generation=r.varint()?, (4,2)=>basis=Some(copy::<MAX_BASIS_BYTES>(r.blob()?)?),
        (10,2)=>input=Some(decode_initialize(r.blob()?)?), (11,2)=>input=Some(decode_observation(r.blob()?)?),
        (12,2)=>input=Some(decode_result(r.blob()?)?), (13,2)=>input=Some(decode_manual(r.blob()?)?), (_,w)=>r.skip(w)?,
    }}
    let (input_id,input_id_len)=input_id?; let(session,session_len)=session?; let(basis,basis_len)=basis?;
    Some(LiveRequest { input_id,input_id_len,session,session_len,module_generation:generation,basis,basis_len,input:input?, scratch:[UnitReference::default();MAX_SELECTION] })
}

fn decode_initialize(bytes:&[u8])->Option<LiveInput>{
    let mut r=Reader::new(bytes); let mut preview=None; let mut profile_ok=false; let mut module_generation=0;
    while !r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,2)=>preview=Some(decode_live_preview_bootstrap(r.blob()?)?),(2,2)=>profile_ok=r.blob()?==b"barc-live-v1",(4,2)=>module_generation=decode_module_generation(r.blob()?)?,(_,w)=>r.skip(w)?}}
    let(session,session_len)=preview?;(profile_ok&&module_generation!=0).then_some(LiveInput::Initialize{session,session_len,module_generation})
}
fn decode_live_preview_bootstrap(bytes:&[u8])->Option<([u8;MAX_SESSION_BYTES],usize)>{let mut r=Reader::new(bytes);let mut ok=false;let mut session=None;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(3,2)=>ok=r.blob()?==b"barc-live-v1",(4,2)=>session=Some(copy::<MAX_SESSION_BYTES>(r.blob()?)?),(_,w)=>r.skip(w)?}}if ok{session}else{None}}
fn decode_module_generation(bytes:&[u8])->Option<u64>{let mut r=Reader::new(bytes);let mut generation=0;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(2,0)=>generation=r.varint()?,(_,w)=>r.skip(w)?}}Some(generation)}

fn decode_ref(bytes:&[u8])->Option<UnitReference>{let mut r=Reader::new(bytes);let mut id=0;let mut life=0;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,0)=>id=r.varint()?,(2,0)=>life=r.varint()?,(_,w)=>r.skip(w)?}}(life!=0).then_some(UnitReference{id,lifetime:life})}

fn decode_observation(bytes:&[u8])->Option<LiveInput>{
    let mut r=Reader::new(bytes);let mut refs=[UnitReference::default();MAX_SELECTION];let mut kinds=[0;MAX_SELECTION];let mut count=0;let mut basis=None;
    while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(2,2)=>basis=Some(copy::<MAX_BASIS_BYTES>(r.blob()?)?),(3,2)=>{if count==MAX_SELECTION{return None}let(mut n,mut rf,mut kind)=(Reader::new(r.blob()?),None,0);while!n.done(){let q=n.varint()?;match(q>>3,(q&7)as u8){(1,2)=>rf=Some(decode_ref(n.blob()?)?),(2,0)=>kind=u8::try_from(n.varint()?).ok()?,(_,w)=>n.skip(w)?}}if !(1..=3).contains(&kind){return None}let value=rf?;if refs[..count].iter().any(|seen|seen.lifetime!=0&&seen.id==value.id){return None}refs[count]=value;kinds[count]=kind;count+=1},(_,w)=>r.skip(w)?}}
    let(basis,basis_len)=basis?;Some(LiveInput::Observation{refs,kinds,count,basis,basis_len})
}

fn decode_result(bytes:&[u8])->Option<LiveInput>{let mut r=Reader::new(bytes);let mut input_id=None;let mut module_generation=0;let mut basis=None;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(3,2)=>input_id=Some(copy::<MAX_IDENTITY_BYTES>(r.blob()?)?),(4,2)=>module_generation=decode_module_generation(r.blob()?)?,(5,2)=>basis=Some(copy::<MAX_BASIS_BYTES>(r.blob()?)?),(_,w)=>r.skip(w)?}}let(input_id,input_id_len)=input_id?;let(basis,basis_len)=basis?;Some(LiveInput::Result{input_id,input_id_len,module_generation,basis,basis_len})}

fn decode_refs(bytes:&[u8])->Option<([UnitReference;MAX_SELECTION],usize)>{let mut r=Reader::new(bytes);let mut refs=[UnitReference::default();MAX_SELECTION];let mut count=0;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,2)=>{if count==MAX_SELECTION{return None}let v=decode_ref(r.blob()?)?;if refs[..count].contains(&v){return None}refs[count]=v;count+=1},(_,w)=>r.skip(w)?}}Some((refs,count))}

fn decode_manual(bytes:&[u8])->Option<LiveInput>{let mut r=Reader::new(bytes);let mut source=0;let mut result=None;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,0)=>source=r.varint()?,(10,2)=>{let(a,n)=decode_refs(r.blob()?)?;result=Some(LiveInput::Select{actors:a,count:n})},(11,2)=>{let(a,n,x)=decode_intent(r.blob()?)?;result=Some(LiveInput::Action{actors:a,count:n,action:x})},(_,w)=>r.skip(w)?}}if !(1..=2).contains(&source){return None}result}

fn decode_intent(bytes:&[u8])->Option<([UnitReference;MAX_SELECTION],usize,Action)>{let mut r=Reader::new(bytes);let mut actors=[UnitReference::default();MAX_SELECTION];let mut count=0;let mut action=None;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,2)=>{if count==MAX_SELECTION{return None}let v=decode_ref(r.blob()?)?;if actors[..count].contains(&v){return None}actors[count]=v;count+=1},(10,2)=>{r.blob()?;action=Some(Action::Stop)},(11,2)=>action=Some(decode_move(r.blob()?)?),(12,2)=>action=Some(decode_attack(r.blob()?)?),(_,w)=>r.skip(w)?}}if count==0{return None}Some((actors,count,action?))}
fn decode_move(bytes:&[u8])->Option<Action>{let mut r=Reader::new(bytes);let mut position=None;let mut policy=None;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,2)=>position=Some(decode_position(r.blob()?)?),(2,0)=>policy=Some(match r.varint()?{1=>MovePolicy::Replace,2=>MovePolicy::Append,_=>return None}),(_,w)=>r.skip(w)?}}Some(Action::Move{position:position?,policy:policy?})}
fn decode_position(bytes:&[u8])->Option<Position3>{let mut r=Reader::new(bytes);let(mut x,mut e,mut z)=(0.0,None,0.0);while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,5)=>x=r.f32()?,(2,5)=>e=Some(r.f32()?),(3,5)=>z=r.f32()?,(_,w)=>r.skip(w)?}}Some(Position3{x,elevation:e,z})}
fn decode_attack(bytes:&[u8])->Option<Action>{let mut r=Reader::new(bytes);let mut target=None;while!r.done(){let k=r.varint()?;match(k>>3,(k&7)as u8){(1,2)=>target=Some(decode_ref(r.blob()?)?),( _,w)=>r.skip(w)?}}Some(Action::Attack{target:target?})}

struct Writer<'a>{b:&'a mut[u8],n:usize} impl<'a>Writer<'a>{fn new(b:&'a mut[u8])->Self{Self{b,n:0}}fn raw(&mut self,v:&[u8])->Option<()>{let e=self.n.checked_add(v.len())?;self.b.get_mut(self.n..e)?.copy_from_slice(v);self.n=e;Some(())}fn varint(&mut self,mut v:u64)->Option<()>{loop{let mut b=(v&127)as u8;v>>=7;if v!=0{b|=128}self.raw(&[b])?;if v==0{return Some(())}}}fn key(&mut self,f:u8,w:u8)->Option<()>{self.varint(u64::from((f<<3)|w))}fn blob(&mut self,f:u8,v:&[u8])->Option<()>{self.key(f,2)?;self.varint(v.len()as u64)?;self.raw(v)}}
fn enc_ref(out:&mut[u8],r:UnitReference)->Option<usize>{let mut w=Writer::new(out);if r.id!=0{w.key(1,0)?;w.varint(r.id)?}w.key(2,0)?;w.varint(r.lifetime)?;Some(w.n)}
fn enc_position(out:&mut[u8],p:Position3)->Option<usize>{let mut w=Writer::new(out);w.key(1,5)?;w.raw(&p.x.to_le_bytes())?;if let Some(e)=p.elevation{w.key(2,5)?;w.raw(&e.to_le_bytes())?}w.key(3,5)?;w.raw(&p.z.to_le_bytes())?;Some(w.n)}
fn enc_intent(out:&mut[u8],actors:&[UnitReference],action:Action)->Option<usize>{let mut w=Writer::new(out);for actor in actors{let mut b=[0;32];let n=enc_ref(&mut b,*actor)?;w.blob(1,&b[..n])?}match action{Action::Stop=>w.blob(10,&[])?,Action::Move{position,policy}=>{let mut p=[0;32];let pn=enc_position(&mut p,position)?;let mut m=[0;64];let mut mw=Writer::new(&mut m);mw.blob(1,&p[..pn])?;mw.key(2,0)?;mw.varint(policy as u64)?;let n=mw.n;w.blob(11,&m[..n])?},Action::Attack{target}=>{let mut rb=[0;32];let rn=enc_ref(&mut rb,target)?;let mut a=[0;40];let mut aw=Writer::new(&mut a);aw.blob(1,&rb[..rn])?;let n=aw.n;w.blob(12,&a[..n])?}}Some(w.n)}
fn encode_response(out:&mut[u8],request:&LiveRequest,intent:Option<(&[UnitReference],usize,Action)>)->Option<usize>{let mut w=Writer::new(out);w.blob(1,&request.input_id[..request.input_id_len])?;w.blob(2,&request.session[..request.session_len])?;w.key(3,0)?;w.varint(request.module_generation)?;w.blob(4,&request.basis[..request.basis_len])?;w.key(5,0)?;w.varint(1)?;if let Some((actors,count,action))=intent{let mut b=[0;1536];let n=enc_intent(&mut b,&actors[..count],action)?;w.blob(10,&b[..n])?}Some(w.n)}

// Added to the private decoded representation after the type definition to
// keep response actor storage bounded and allocation-free.
fn request_action_actor(request:&mut LiveRequest,index:usize,value:UnitReference){request.scratch[index]=value}
