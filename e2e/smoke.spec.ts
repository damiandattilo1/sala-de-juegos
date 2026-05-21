import { test, expect } from '@playwright/test';

test.describe('Smoke UI', () => {
  test('loads public pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Sala de Juegos' })).toBeVisible();

    await page.goto('/ingresar');
    await expect(page.getByRole('heading', { name: /Iniciar Sesi[oó]n/i })).toBeVisible();

    await page.goto('/registro');
    await expect(page.getByRole('heading', { name: 'Registro' })).toBeVisible();

    await page.goto('/quien-soy');
    await expect(page.getByRole('heading', { name: /Qui[eé]n Soy/i })).toBeVisible();
  });

  test('redirects private routes when not authenticated', async ({ page }) => {
    await page.goto('/preguntados');
    await expect(page).toHaveURL(/\/ingresar$/);
  });

  test('quick login allows opening preguntados', async ({ page }) => {
    await page.goto('/ingresar');
    await page.getByRole('button', { name: 'Usuario 1' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/preguntados');
    await expect(page.getByRole('heading', { name: 'Preguntados' })).toBeVisible();

    const loading = page.getByText('Cargando preguntas...');
    const question = page.getByText(/Pregunta \d+ \/ \d+/);
    await expect(loading.or(question)).toBeVisible();
  });
});
