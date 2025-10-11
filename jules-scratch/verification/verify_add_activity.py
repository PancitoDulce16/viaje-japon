
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # Wait for the landing page to be visible
    expect(page.locator("#landingPage")).to_be_visible()

    # Use evaluate to set a dummy trip, switch to the dashboard view, and init the app
    page.evaluate("""() => {
        localStorage.setItem('currentTripId', 'dummyTrip');
        document.getElementById('landingPage').classList.add('hidden');
        document.getElementById('appDashboard').classList.remove('hidden');
        if (window.initApp) {
            window.initApp();
        }
    }""")

    # Give the app a longer moment to initialize, especially for async operations
    page.wait_for_timeout(2000)

    # Now that the dashboard is visible, the itinerary should be there
    expect(page.locator("#content-itinerary")).to_be_visible()

    # Click the "Añadir Actividad" button for the first day.
    add_button = page.locator("#addActivityBtn_1")
    expect(add_button).to_be_visible()
    add_button.click()

    # Wait for the modal to be visible
    activity_modal = page.locator("#activityModal")
    expect(activity_modal).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/add_activity_modal.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
