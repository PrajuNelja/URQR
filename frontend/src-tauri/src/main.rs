#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    let kiosk_mode = std::env::args().any(|argument| argument == "--kiosk");

    tauri::Builder::default()
        .setup(move |app| {
            if kiosk_mode {
                let window = app.get_webview_window("main").ok_or_else(|| {
                    std::io::Error::new(
                        std::io::ErrorKind::NotFound,
                        "Tauri main window was not created",
                    )
                })?;
                window.set_always_on_top(true)?;
                window.set_decorations(false)?;
                window.set_fullscreen(true)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run URQR Manager POS");
}
