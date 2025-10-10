from playwright.sync_api import sync_playwright, Page, expect

def verify_phase1_improvements(page: Page):
    """
    Verifies the UI improvements made in Phase 1.
    """
    # 1. Navigate to the page.
    page.goto("http://localhost:8000")

    # Manually trigger the empty header state for testing since we are not logged in.
    page.evaluate("window.TripsManager.updateTripHeaderEmpty()")

    # 2. Verify the "Crear Viaje" button in the empty header.
    add_trip_button = page.locator("button", has_text="➕ Crear Viaje")
    expect(add_trip_button).to_be_visible(timeout=10000)
    expect(add_trip_button).to_have_class(
        "text-xs bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition font-semibold"
    )

    # 3. Click the "Crear Viaje" button and verify the modal opens.
    add_trip_button.click()
    create_trip_modal_title = page.locator("h2", has_text="Crear Nuevo Viaje")
    expect(create_trip_modal_title).to_be_visible()
    page.screenshot(path="jules-scratch/verification/phase1_01_create_modal.png")

    # 4. Close the modal.
    # Assuming there's a close button in the modal. Let's find a generic close button.
    # Note: This relies on the modal having a close button that `ModalRenderer` creates.
    page.locator("#modal-create-trip .modal-close").click()
    expect(create_trip_modal_title).not_to_be_visible()

    # 5. Verify the tab transition animation.
    # Click on the "Preparation" tab.
    preparation_tab_button = page.locator("button[data-tab='preparation']")
    preparation_tab_button.click()

    # The content should now have animation classes.
    preparation_content = page.locator("#content-preparation")
    expect(preparation_content).to_have_class("tab-content animate__animated animate__fadeIn")
    expect(preparation_content).to_be_visible()

    page.wait_for_timeout(1000) # Wait for animation to be visible
    page.screenshot(path="jules-scratch/verification/phase1_02_tab_animation.png")

# --- Playwright setup ---
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    verify_phase1_improvements(page)
    browser.close()

print("Phase 1 verification script finished and screenshots taken.")
