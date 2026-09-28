#![no_std]

use core::{ptr, slice};

pub const ABI_VERSION: u32 = 1;
pub const MAX_SELECTION: usize = 64;
pub const MAX_SESSION_BYTES: usize = 64;
pub const MAX_OUTPUT_BYTES: usize = 2048;

#[derive(Clone, Copy)]
pub struct Position3 {
    pub x: f32,
    pub elevation: Option<f32>,
    pub z: f32,
}

pub enum Input {
    Initialize { bootstrap_session: [u8; MAX_SESSION_BYTES], bootstrap_session_length: usize },
    Observation {
        session: [u8; MAX_SESSION_BYTES], session_length: usize, sequence: u64,
        unit_ids: [u64; MAX_SELECTION], kinds: [u8; MAX_SELECTION], count: usize,
    },
    Select { unit_ids: [u64; MAX_SELECTION], count: usize },
    GroundTarget(Position3),
}

pub struct GuestRequest {
    pub request_id: u64,
    pub session_id: [u8; MAX_SESSION_BYTES],
    pub session_length: usize,
    pub context_sequence: u64,
    pub input: Input,
}

pub trait PreviewPolicy {
    fn retain_unit(unit_id: u64) -> bool;
}

pub struct GuestState {
    selected: [u64; MAX_SELECTION],
    selected_count: usize,
    observed_ids: [u64; MAX_SELECTION],
    observed_kinds: [u8; MAX_SELECTION],
    observed_count: usize,
    session_id: [u8; MAX_SESSION_BYTES],
    session_length: usize,
    context_sequence: u64,
    output: [u8; MAX_OUTPUT_BYTES],
}

impl GuestState {
    pub const fn new() -> Self {
        Self {
            selected: [0; MAX_SELECTION], selected_count: 0,
            observed_ids: [0; MAX_SELECTION], observed_kinds: [0; MAX_SELECTION], observed_count: 0,
            session_id: [0; MAX_SESSION_BYTES], session_length: 0, context_sequence: 0,
            output: [0; MAX_OUTPUT_BYTES],
        }
    }

    pub fn reset(&mut self) { self.selected_count = 0; self.observed_count = 0; self.session_length = 0; self.context_sequence = 0; }

    pub fn initialize(&mut self, bytes: &[u8]) -> Result<&[u8], i32> {
        let request = decode_request(bytes).ok_or(2)?;
        let Input::Initialize { bootstrap_session, bootstrap_session_length } = request.input else { return Err(2); };
        if request.context_sequence != 0
            || request.session_length == 0
            || request.session_id[..request.session_length] != bootstrap_session[..bootstrap_session_length] { return Err(2); }
        self.reset();
        self.session_id[..request.session_length].copy_from_slice(&request.session_id[..request.session_length]);
        self.session_length = request.session_length;
        let length = encode_response(&mut self.output, request.request_id, &request.session_id[..request.session_length], 0, &[], None).ok_or(4)?;
        Ok(&self.output[..length])
    }

    pub fn process<P: PreviewPolicy>(&mut self, bytes: &[u8]) -> Result<Option<&[u8]>, i32> {
        let request = decode_request(bytes).ok_or(3)?;
        if self.session_length == 0 || request.session_id[..request.session_length] != self.session_id[..self.session_length] {
            return Err(5);
        }
        match request.input {
            Input::Initialize { .. } => Err(3),
            Input::Observation { session, session_length, sequence, unit_ids, kinds, count } => {
                if session_length != request.session_length
                    || session[..session_length] != request.session_id[..request.session_length]
                    || sequence != request.context_sequence { return Err(6); }
                self.observed_ids[..count].copy_from_slice(&unit_ids[..count]);
                self.observed_kinds[..count].copy_from_slice(&kinds[..count]);
                self.observed_count = count;
                self.context_sequence = request.context_sequence;
                self.selected_count = 0;
                let length = encode_response(&mut self.output, request.request_id, &request.session_id[..request.session_length], request.context_sequence, &[], None).ok_or(4)?;
                Ok(Some(&self.output[..length]))
            }
            Input::Select { unit_ids, count } => {
                if request.context_sequence != self.context_sequence { return Err(6); }
                self.selected_count = 0;
                for unit_id in unit_ids[..count].iter().copied() {
                    let observed = self.observed_ids[..self.observed_count].iter().position(|value| *value == unit_id);
                    if observed.is_some_and(|index| self.observed_kinds[index] == 1) && P::retain_unit(unit_id) {
                        self.selected[self.selected_count] = unit_id;
                        self.selected_count += 1;
                    }
                }
                let length = encode_response(&mut self.output, request.request_id, &request.session_id[..request.session_length], request.context_sequence, &[], None).ok_or(4)?;
                Ok(Some(&self.output[..length]))
            }
            Input::GroundTarget(position) => {
                if request.context_sequence != self.context_sequence { return Err(6); }
                let length = encode_response(
                    &mut self.output,
                    request.request_id,
                    &request.session_id[..request.session_length],
                    request.context_sequence,
                    &self.selected[..self.selected_count],
                    (self.selected_count != 0).then_some(position),
                ).ok_or(4)?;
                Ok(Some(&self.output[..length]))
            }
        }
    }
}

impl Default for GuestState { fn default() -> Self { Self::new() } }

#[repr(align(4))]
pub struct Arena<const N: usize> {
    bytes: [u8; N],
    next: usize,
}

impl<const N: usize> Arena<N> {
    pub const fn new() -> Self { Self { bytes: [0; N], next: 0 } }

    pub fn allocate(&mut self, length: u32) -> u32 {
        if length == 0 { return 0; }
        let aligned = (self.next + 3) & !3;
        let Some(end) = aligned.checked_add(length as usize) else { return 0; };
        if end > N { return 0; }
        self.next = end;
        unsafe { self.bytes.as_mut_ptr().add(aligned) as u32 }
    }

    pub fn free(&mut self, pointer: u32, length: u32) {
        if pointer == 0 || length == 0 { return; }
        let base = self.bytes.as_ptr() as usize;
        let Some(offset) = (pointer as usize).checked_sub(base) else { return; };
        if offset.checked_add(length as usize) == Some(self.next) { self.next = offset; }
    }

    pub fn reset(&mut self) { self.next = 0; }
}

pub unsafe fn input_slice<'a>(pointer: u32, length: u32) -> &'a [u8] {
    if length == 0 { &[] } else { slice::from_raw_parts(pointer as *const u8, length as usize) }
}

pub unsafe fn write_descriptor(descriptor: u32, output: Option<&[u8]>) {
    let (pointer, length) = output.map_or((0, 0), |bytes| (bytes.as_ptr() as u32, bytes.len() as u32));
    ptr::write_unaligned(descriptor as *mut u32, pointer.to_le());
    ptr::write_unaligned((descriptor + 4) as *mut u32, length.to_le());
}

pub unsafe fn descriptor_is_zero(descriptor: u32) -> bool {
    ptr::read_unaligned(descriptor as *const u32) == 0
        && ptr::read_unaligned((descriptor + 4) as *const u32) == 0
}

struct Reader<'a> { bytes: &'a [u8], index: usize }
impl<'a> Reader<'a> {
    fn new(bytes: &'a [u8]) -> Self { Self { bytes, index: 0 } }
    fn done(&self) -> bool { self.index == self.bytes.len() }
    fn byte(&mut self) -> Option<u8> { let value = *self.bytes.get(self.index)?; self.index += 1; Some(value) }
    fn varint(&mut self) -> Option<u64> {
        let mut value = 0u64;
        for shift in (0..=63).step_by(7) {
            let byte = self.byte()?;
            if shift == 63 && byte > 1 { return None; }
            value |= u64::from(byte & 0x7f) << shift;
            if byte & 0x80 == 0 { return Some(value); }
        }
        None
    }
    fn length(&mut self) -> Option<&'a [u8]> {
        let length = usize::try_from(self.varint()?).ok()?;
        let end = self.index.checked_add(length)?;
        let result = self.bytes.get(self.index..end)?;
        self.index = end;
        Some(result)
    }
    fn fixed32(&mut self) -> Option<f32> {
        let end = self.index.checked_add(4)?;
        let raw: [u8; 4] = self.bytes.get(self.index..end)?.try_into().ok()?;
        self.index = end;
        Some(f32::from_le_bytes(raw))
    }
    fn skip(&mut self, wire: u8) -> Option<()> {
        match wire {
            0 => { self.varint()?; }
            1 => { self.index = self.index.checked_add(8)?; }
            2 => { self.length()?; }
            5 => { self.index = self.index.checked_add(4)?; }
            _ => return None,
        }
        (self.index <= self.bytes.len()).then_some(())
    }
}

fn decode_request(bytes: &[u8]) -> Option<GuestRequest> {
    let mut reader = Reader::new(bytes);
    let mut request_id = None;
    let mut session = [0u8; MAX_SESSION_BYTES];
    let mut session_length = 0;
    let mut context_sequence = 0;
    let mut input = None;
    while !reader.done() {
        let key = reader.varint()?;
        let field = key >> 3;
        let wire = (key & 7) as u8;
        match (field, wire) {
            (1, 0) => request_id = Some(reader.varint()?),
            (2, 2) => {
                let value = reader.length()?;
                if value.len() > MAX_SESSION_BYTES { return None; }
                session[..value.len()].copy_from_slice(value);
                session_length = value.len();
            }
            (3, 0) => context_sequence = reader.varint()?,
            (10, 2) => input = Some(decode_initialize(reader.length()?)?),
            (11, 2) => input = Some(decode_observation(reader.length()?)?),
            (12, 2) => input = Some(decode_select(reader.length()?)?),
            (13, 2) => input = Some(Input::GroundTarget(decode_ground_target(reader.length()?)?)),
            _ => reader.skip(wire)?,
        }
    }
    Some(GuestRequest {
        request_id: request_id?, session_id: session, session_length,
        context_sequence, input: input?,
    })
}

fn decode_initialize(bytes: &[u8]) -> Option<Input> {
    let mut reader = Reader::new(bytes);
    let mut game_ok = false;
    let mut protocol_ok = false;
    let mut profile_ok = false;
    let mut session = [0u8; MAX_SESSION_BYTES];
    let mut session_length = 0;
    let mut mode_ok = false;
    while !reader.done() {
        let key = reader.varint()?;
        let field = key >> 3;
        let wire = (key & 7) as u8;
        match (field, wire) {
            (1, 2) => game_ok = reader.length()? == b"bar",
            (2, 2) => protocol_ok = reader.length()? == b"1.0.0",
            (3, 2) => profile_ok = reader.length()? == b"barc-preview-v1",
            (4, 2) => { let value = reader.length()?; if value.len() > MAX_SESSION_BYTES { return None; } session[..value.len()].copy_from_slice(value); session_length = value.len(); }
            (6, 0) => mode_ok = reader.varint()? == 1,
            _ => reader.skip(wire)?,
        }
    }
    (game_ok && protocol_ok && profile_ok && mode_ok && session_length != 0).then_some(Input::Initialize {
        bootstrap_session: session, bootstrap_session_length: session_length,
    })
}

fn decode_observation(bytes: &[u8]) -> Option<Input> {
    let mut reader = Reader::new(bytes);
    let mut nested_session = [0u8; MAX_SESSION_BYTES];
    let mut nested_session_length = 0;
    let mut nested_sequence = None;
    let mut unit_ids = [0u64; MAX_SELECTION];
    let mut kinds = [0u8; MAX_SELECTION];
    let mut count = 0;
    while !reader.done() {
        let key = reader.varint()?;
        let field = key >> 3;
        let wire = (key & 7) as u8;
        match (field, wire) {
            (1, 2) => { let value = reader.length()?; if value.len() > MAX_SESSION_BYTES { return None; } nested_session[..value.len()].copy_from_slice(value); nested_session_length = value.len(); },
            (2, 0) => nested_sequence = Some(reader.varint()?),
            (6, 2) => {
                if count == MAX_SELECTION { return None; }
                let (id, kind) = decode_observed_unit(reader.length()?)?;
                unit_ids[count] = id; kinds[count] = kind; count += 1;
            }
            _ => reader.skip(wire)?,
        }
    }
    if nested_session_length == 0 { return None; }
    Some(Input::Observation {
        session: nested_session, session_length: nested_session_length, sequence: nested_sequence?,
        unit_ids, kinds, count,
    })
}

fn decode_observed_unit(bytes: &[u8]) -> Option<(u64, u8)> {
    let mut reader = Reader::new(bytes);
    let mut id = None;
    let mut kind = 0;
    while !reader.done() {
        let key = reader.varint()?;
        match (key >> 3, (key & 7) as u8) {
            (1, 0) => id = Some(reader.varint()?),
            (4, 0) => kind = u8::try_from(reader.varint()?).ok()?,
            (_, wire) => reader.skip(wire)?,
        }
    }
    Some((id?, kind))
}

fn decode_select(bytes: &[u8]) -> Option<Input> {
    let mut reader = Reader::new(bytes);
    let mut unit_ids = [0u64; MAX_SELECTION];
    let mut count = 0;
    while !reader.done() {
        let key = reader.varint()?;
        match (key >> 3, (key & 7) as u8) {
            (1, 0) => { if count == MAX_SELECTION { return None; } unit_ids[count] = reader.varint()?; count += 1; }
            (1, 2) => {
                let mut packed = Reader::new(reader.length()?);
                while !packed.done() {
                    if count == MAX_SELECTION { return None; }
                    unit_ids[count] = packed.varint()?;
                    count += 1;
                }
            }
            (_, wire) => reader.skip(wire)?,
        }
    }
    Some(Input::Select { unit_ids, count })
}

fn decode_ground_target(bytes: &[u8]) -> Option<Position3> {
    let mut outer = Reader::new(bytes);
    let mut position = None;
    while !outer.done() {
        let key = outer.varint()?;
        match (key >> 3, (key & 7) as u8) {
            (1, 2) => position = Some(decode_position(outer.length()?)?),
            (_, wire) => outer.skip(wire)?,
        }
    }
    position
}

fn decode_position(bytes: &[u8]) -> Option<Position3> {
    let mut reader = Reader::new(bytes);
    let (mut x, mut elevation, mut z) = (None, None, None);
    while !reader.done() {
        let key = reader.varint()?;
        match (key >> 3, (key & 7) as u8) {
            (1, 5) => x = Some(reader.fixed32()?),
            (2, 5) => elevation = Some(reader.fixed32()?),
            (3, 5) => z = Some(reader.fixed32()?),
            (_, wire) => reader.skip(wire)?,
        }
    }
    Some(Position3 { x: x?, elevation, z: z? })
}

struct Writer<'a> { bytes: &'a mut [u8], length: usize }
impl<'a> Writer<'a> {
    fn new(bytes: &'a mut [u8]) -> Self { Self { bytes, length: 0 } }
    fn raw(&mut self, values: &[u8]) -> Option<()> {
        let end = self.length.checked_add(values.len())?;
        self.bytes.get_mut(self.length..end)?.copy_from_slice(values);
        self.length = end; Some(())
    }
    fn byte(&mut self, value: u8) -> Option<()> { self.raw(&[value]) }
    fn varint(&mut self, mut value: u64) -> Option<()> {
        loop {
            let mut byte = (value & 0x7f) as u8;
            value >>= 7;
            if value != 0 { byte |= 0x80; }
            self.byte(byte)?;
            if value == 0 { return Some(()); }
        }
    }
    fn key(&mut self, field: u8, wire: u8) -> Option<()> { self.varint(u64::from((field << 3) | wire)) }
    fn length_delimited(&mut self, field: u8, value: &[u8]) -> Option<()> {
        self.key(field, 2)?; self.varint(value.len() as u64)?; self.raw(value)
    }
}

fn encode_position(buffer: &mut [u8], position: Position3) -> Option<usize> {
    let mut writer = Writer::new(buffer);
    writer.key(1, 5)?; writer.raw(&position.x.to_le_bytes())?;
    if let Some(elevation) = position.elevation { writer.key(2, 5)?; writer.raw(&elevation.to_le_bytes())?; }
    writer.key(3, 5)?; writer.raw(&position.z.to_le_bytes())?;
    Some(writer.length)
}

fn encode_response(buffer: &mut [u8], request_id: u64, session: &[u8], consumed_sequence: u64, units: &[u64], position: Option<Position3>) -> Option<usize> {
    let mut packed = [0u8; 640];
    let mut packed_writer = Writer::new(&mut packed);
    for value in units { packed_writer.varint(*value)?; }
    let packed_length = packed_writer.length;
    let mut position_bytes = [0u8; 32];
    let position_length = position.and_then(|value| encode_position(&mut position_bytes, value));
    let mut move_bytes = [0u8; 768];
    let mut move_writer = Writer::new(&mut move_bytes);
    if position.is_some() {
        move_writer.length_delimited(1, &packed[..packed_length])?;
        move_writer.length_delimited(2, &position_bytes[..position_length?])?;
    }
    let move_length = move_writer.length;
    let mut writer = Writer::new(buffer);
    writer.key(1, 0)?; writer.varint(request_id)?;
    writer.length_delimited(2, session)?;
    if consumed_sequence != 0 { writer.key(3, 0)?; writer.varint(consumed_sequence)?; }
    writer.key(4, 0)?; writer.varint(1)?;
    if position.is_some() { writer.key(6, 0)?; writer.varint(1)?; writer.length_delimited(10, &move_bytes[..move_length])?; }
    Some(writer.length)
}

#[macro_export]
macro_rules! export_preview_guest {
    ($policy:ty) => {
        use core::panic::PanicInfo;
        static mut BARC_ARENA: $crate::Arena<{ 4 * 1024 * 1024 }> = $crate::Arena::new();
        static mut BARC_STATE: $crate::GuestState = $crate::GuestState::new();

        #[panic_handler]
        fn panic(_info: &PanicInfo) -> ! { loop {} }

        #[no_mangle]
        pub extern "C" fn barc_abi_version() -> u32 { $crate::ABI_VERSION }

        #[no_mangle]
        pub extern "C" fn barc_alloc(length: u32) -> u32 {
            #[cfg(feature = "hang-alloc")] loop {}
            #[cfg(feature = "trap-alloc")] core::arch::wasm32::unreachable();
            unsafe { BARC_ARENA.allocate(length) }
        }

        #[no_mangle]
        pub extern "C" fn barc_free(pointer: u32, length: u32) {
            #[cfg(feature = "hang-free")] loop {}
            #[cfg(feature = "trap-free")] core::arch::wasm32::unreachable();
            unsafe { BARC_ARENA.free(pointer, length) }
        }

        #[no_mangle]
        pub extern "C" fn barc_initialize(_pointer: u32, length: u32, descriptor: u32) -> i32 {
            #[cfg(feature = "hang-init")] loop {}
            #[cfg(feature = "trap-init")] core::arch::wasm32::unreachable();
            #[cfg(feature = "require-zero-descriptor")]
            if !unsafe { $crate::descriptor_is_zero(descriptor) } { return 91; }
            let input = unsafe { $crate::input_slice(_pointer, length) };
            match unsafe { BARC_STATE.initialize(input) } {
                Ok(output) => { unsafe { $crate::write_descriptor(descriptor, Some(output)); } 0 }
                Err(status) => { unsafe { $crate::write_descriptor(descriptor, None); } status }
            }
        }

        #[no_mangle]
        pub extern "C" fn barc_process(pointer: u32, length: u32, descriptor: u32) -> i32 {
            #[cfg(feature = "hang-process")] loop {}
            #[cfg(feature = "trap-process")] core::arch::wasm32::unreachable();
            #[cfg(feature = "require-zero-descriptor")]
            if !unsafe { $crate::descriptor_is_zero(descriptor) } { return 91; }
            #[cfg(feature = "oob-descriptor")] { unsafe { core::ptr::write_unaligned(descriptor as *mut u32, 0xfffffff0u32.to_le()); core::ptr::write_unaligned((descriptor + 4) as *mut u32, 32u32.to_le()); } return 0; }
            #[cfg(feature = "overlap-output")] { unsafe { core::ptr::write_unaligned(descriptor as *mut u32, pointer.to_le()); core::ptr::write_unaligned((descriptor + 4) as *mut u32, length.to_le()); } return 0; }
            #[cfg(feature = "malformed-output")] { static BAD: [u8; 2] = [0x08, 0xff]; unsafe { $crate::write_descriptor(descriptor, Some(&BAD)); } return 0; }
            #[cfg(feature = "oversized-output")] { static BIG: [u8; 65537] = [0; 65537]; unsafe { $crate::write_descriptor(descriptor, Some(&BIG)); } return 0; }
            let input = unsafe { $crate::input_slice(pointer, length) };
            match unsafe { BARC_STATE.process::<$policy>(input) } {
                Ok(output) => { unsafe { $crate::write_descriptor(descriptor, output); } 0 }
                Err(status) => { unsafe { $crate::write_descriptor(descriptor, None); } status },
            }
        }

        #[no_mangle]
        pub extern "C" fn barc_shutdown() -> i32 {
            #[cfg(feature = "hang-shutdown")] loop {}
            #[cfg(feature = "trap-shutdown")] core::arch::wasm32::unreachable();
            unsafe { BARC_STATE.reset(); BARC_ARENA.reset(); }
            0
        }
    };
}
