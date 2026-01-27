import { test, expect } from '@playwright/test';

jest.mock('@apollo/client', () => ({
  gql: (strings: any) => strings[0]
}));

jest.mock('@apollo/client/react', () => ({
  useSubscription: () => ({ loading: false, data: null, error: null }),
}));

jest.mock('../../hooks/use-sync', () => ({
  useSync: () => ({ status: null, pendingItems: 0, sync: null, lastSync: null}),
}));



test('send a successful registred incident', async ({ page, context }) => {
    await context.setGeolocation({ longitude: 0.5, latitude: 0.5 });
    await context.grantPermissions(['geolocation']);

    await page.goto('http://localhost:3000');

    await page.click('button[key="FLORE"]');
    await page.click('button[key="LOW"]');


    await page.fill('textarea[id="description"]', 'Incendie zone Nord');
    await page.click('button[type="submit"]');

    const successMessage = page.locator('text=Signalement envoyé en direct!');
    await expect(successMessage).toBeVisible();
});
