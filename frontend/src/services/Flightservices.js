import api from "../services/api";

export const searchFlights = ({ from, to, date, passengers, cabin }) =>
  api.get(
    `/flights/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}&cabin=${cabin}`
  );

export const getFlightDetails = (flightId, date, passengers, cabin) =>
  api.get(
    `/flights/details?flightId=${flightId}&date=${date}&passengers=${passengers}&cabin=${cabin}`
  );

export const bookFlight = (payload) =>
  api.post("/flights/book", payload);

export const checkFlightPNR = (pnr) =>
  api.get(`/flights/pnr/${pnr}`);

export const getMyFlightBookings = () =>
  api.get("/flights/my-bookings");

export const cancelFlight = (pnr) =>
  api.post(`/flights/cancel/${pnr}`);