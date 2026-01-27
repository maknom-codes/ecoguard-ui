/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';


test('send a successful registred incident', async ({ page, context }) => {
    await context.setGeolocation({ longitude: 0.5, latitude: 0.5 });
    await context.grantPermissions(['geolocation']);

    await page.goto('http://localhost:3000');

    await page.getByTestId('btn-flore').click();
    await page.getByTestId('btn-low').click();


    await page.getByTestId('description').fill('Incendie zone Nord');
    await page.click('button[type="submit"]');

    const successMessage = page.locator('text=Signalement envoyé en direct!');
    await expect(successMessage).toBeVisible();
});
