import { Injectable } from "@nestjs/common";

@Injectable()
export class OpencageService {
    async geocode(address: string): Promise<{ lat: number; lng: number }> {
        const apiKey = process.env.OPENCAGE_API_KEY;
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("Alamat tidak ditemukan");
        }

        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
    }



}