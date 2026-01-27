/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';


test('send a successful registred incident', async ({ page, context }) => {
    await page.goto('http://localhost:3000');

    await page.fill('input[name="email"]', 'koko.popom@gmail.com');
    await page.fill('input[name="password"]', 'koko');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);


    await context.setGeolocation({ longitude: 0.5, latitude: 0.5 });
    await context.grantPermissions(['geolocation']);

    await page.screenshot({ path: 'screenshot.png' });
    await page.getByTestId('signaler').click();
    
    await page.getByTestId('btn-flore').click();
    await page.getByTestId('btn-low').click();
    
    
    await page.getByTestId('description').fill('Incendie zone Nord');
    await page.getByTestId('suivant').click();

    await page.click('button[type="submit"]');
    await page.screenshot({ path: 'screenshot.png' });

    const successMessage = page.locator('text=Signalement envoyé en direct!');
    await expect(successMessage).toBeVisible();
});
