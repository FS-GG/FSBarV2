#![no_std]

use barc_guest_sdk::{export_preview_guest, MovePolicy, PreviewPolicy};

// A separately authored policy can be imported as raw WASM without rebuilding
// the host. This example only previews odd unit identities selected by its user.
struct OddIdentitySelection;
impl PreviewPolicy for OddIdentitySelection {
    fn retain_unit(unit_id: u64) -> bool { unit_id & 1 == 1 }
    fn live_move_policy(policy: MovePolicy) -> MovePolicy {
        match policy { MovePolicy::Replace => MovePolicy::Append, MovePolicy::Append => MovePolicy::Replace }
    }
}

export_preview_guest!(OddIdentitySelection);
