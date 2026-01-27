import { render, screen } from "@testing-library/react";
import React from "react";
import Dashboard from "../pages/dashboard";


jest.mock('leaflet', () => ({
  ...jest.requireActual('leaflet'),
  control: () => ({ addType: jest.fn(), addTo: jest.fn() }),
  map: () => ({ setView: jest.fn(), addLayer: jest.fn() }),
}));

jest.mock('@apollo/client', () => ({
  gql: (strings: any) => strings[0]
}));

jest.mock('@apollo/client/react', () => ({
  useSubscription: () => ({ loading: false, data: null, error: null }),
}));

jest.mock('../hooks/use-sync', () => ({
  useSync: () => ({ status: null, pendingItems: 0, sync: null, lastSync: null}),
}));

jest.mock('../components/mapviewer', () => () => <div data-testid="mock-mapviewer" children="Carte"/>);
jest.mock('../components/set-incident', () => () => <div data-testid="mock-form" children="Formulaire"/>);



test('check if title Ecoguard is present', () => {
  render(
      <Dashboard />
  );
  const linkElement = screen.getByText(/EcoGuard/i);
  expect(linkElement).toBeInTheDocument();
});