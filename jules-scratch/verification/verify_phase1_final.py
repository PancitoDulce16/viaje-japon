from playwright.sync_api import sync_playwright, Page, expect

def verify_phase1_final(page: Page):
    """
    Verifies the UI improvements made in Phase 1, adapting to the logged-out state.
    """
    # 1. Navigate to the page.
    page.goto("http://localhost:8000")

    # 2. Manually trigger the empty header for the test environment.
    page.evaluate("window.TripsManager.updateTripHeaderEmpty()")

    # 3. Verify the "Crear Viaje" button in the empty header.
    add_trip_button = page.locator("#currentTripHeader button", has_text="➕ Crear Viaje")
    expect(add_trip_button).to_be_visible(timeout=10000)

    # 4. Click it and check that the create modal opens.
    add_trip_button.click()
    create_trip_modal_title = page.locator("h2", has_text="Crear Nuevo Viaje")
    expect(create_trip_modal_title).to_be_visible()
    page.screenshot(path="jules-scratch/verification/phase1_final_01_modal.png")

    # 5. Close the modal.
    # This assumes a close button exists from previous implementations.
    # A more robust selector might be needed if it fails.
    page.locator("#modal-create-trip button.modal-close").click()
    expect(create_trip_modal_title).not_to_be_visible()

    # 6. Verify tab animations.
    preparation_tab = page.locator("button[data-tab='preparation']")
    preparation_tab.click()

    preparation_content = page.locator("#content-preparation")
    expect(preparation_content).to_have_class("tab-content animate__animated animate__fadeIn")
    page.wait_for_timeout(500) # Wait for animation
    page.screenshot(path="jules-scratch/verification/phase1_final_02_animation.png")


# --- Playwright setup ---
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    verify_phase1_final(page)
    browser.close()

print("Phase 1 final verification script finished and screenshots taken.")
