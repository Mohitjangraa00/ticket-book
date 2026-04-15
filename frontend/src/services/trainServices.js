/**
 * trainServices.js
 * All train API calls — uses the central api helper
 * which automatically attaches JWT token to every request.
 */
import api from "./api";

export const searchTrains = ({ from, to, date, classType }) =>
  api.get(`/trains/search?from=${from}&to=${to}&date=${date}&class=${classType}`);

export const getTrainDetails = (trainNo, from, to, date) =>
  api.get(`/trains/details?trainNo=${trainNo}&from=${from}&to=${to}&date=${date}`);

// Book — requires login (token auto-attached by api helper)
export const bookTrain = (payload) =>
  api.post("/trains/book", payload);

export const checkPNR = (pnr) =>
  api.get(`/trains/pnr/${pnr}`);

// My bookings — requires login
export const getMyBookings = () =>
  api.get("/trains/my-bookings");

// Cancel — requires login
export const cancelBooking = (pnr) =>
  api.post(`/trains/cancel/${pnr}`);