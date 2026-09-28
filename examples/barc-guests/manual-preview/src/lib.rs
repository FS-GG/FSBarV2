#![no_std]
#![allow(unreachable_code)]

use barc_guest_sdk::{export_preview_guest, PreviewPolicy};

struct ManualSelection;
impl PreviewPolicy for ManualSelection {
    fn retain_unit(_unit_id: u64) -> bool { true }
}

export_preview_guest!(ManualSelection);
