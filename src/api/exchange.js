import axios from "axios";


const RATES_URL = "https://api.exchangerate-api.com/v4/latest/USD";

export const CURRENCIES = ["JOD", "EUR", "GBP", "AED", "SAR", "CAD"];

export const getRates = () => axios.get(RATES_URL).then((res) => res.data.rates);
