"""Add test-only adversaries to the isolated guest source copy, never product sources."""
from pathlib import Path
root = Path(__file__).parent / '.guests'
crate = root / 'examples/barc-guests/manual-preview/Cargo.toml'
text = crate.read_text().replace('[profile.release]', 'foreign-output = []\nempty-output = []\nunaligned-output = []\nbad-abi = []\n\n[profile.release]')
crate.write_text(text)
sdk = root / 'sdk/barc/barc-guest-sdk/src/lib.rs'
text = sdk.read_text().replace('pub extern "C" fn barc_abi_version() -> u32 { $crate::ABI_VERSION }', 'pub extern "C" fn barc_abi_version() -> u32 { if cfg!(feature = "bad-abi") { 2 } else { $crate::ABI_VERSION } }')
text = text.replace('#[cfg(feature = "malformed-output")]', '''#[cfg(feature = "empty-output")] { unsafe { $crate::write_descriptor(descriptor, None); } return 0; }
            #[cfg(feature = "foreign-output")] {
                #[repr(align(4))] struct Aligned([u8; 7]);
                static BAD: Aligned = Aligned([8, 99, 18, 1, 65, 32, 1]);
                unsafe { $crate::write_descriptor(descriptor, Some(&BAD.0)); } return 0;
            }
            #[cfg(feature = "unaligned-output")] {
                #[repr(align(4))] struct Aligned([u8; 8]);
                static BAD: Aligned = Aligned([0, 8, 99, 18, 1, 65, 32, 1]);
                unsafe { $crate::write_descriptor(descriptor, Some(&BAD.0[1..])); } return 0;
            }
            #[cfg(feature = "malformed-output")]''')
sdk.write_text(text)
