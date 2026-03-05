import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";

// --- ADVERTISEMENTS ---
export async function fetchAds() {
    try {
        const q = query(collection(db, "advertisements"), orderBy("sort_order"));
        const querySnapshot = await getDocs(q);
        const ads = [];
        querySnapshot.forEach((doc) => { ads.push(doc.data()); });
        return ads;
    } catch (error) {
        console.error('Error fetching ads from Firebase:', error);
        return null;
    }
}

export async function saveAds(adsArray) {
    try {
        const batchAds = adsArray.map((ad, idx) => ({ ...ad, sort_order: idx }));

        // Delete existing
        const q = query(collection(db, "advertisements"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((d) => { deletePromises.push(deleteDoc(doc(db, "advertisements", d.id))); });
        await Promise.all(deletePromises);

        // Insert new (preserving local IDs)
        const insertPromises = batchAds.map(ad => {
            const docRef = ad.id ? doc(db, "advertisements", String(ad.id)) : doc(collection(db, "advertisements"));
            return setDoc(docRef, { ...ad, id: docRef.id });
        });
        await Promise.all(insertPromises);
    } catch (error) {
        console.error('Error saving ads to Firebase:', error);
        throw error;
    }
}

// --- STATS ---
export async function fetchStats() {
    try {
        const q = query(collection(db, "stats"), orderBy("sort_order"));
        const querySnapshot = await getDocs(q);
        const stats = [];
        querySnapshot.forEach((doc) => { stats.push(doc.data()); });
        return stats.length > 0 ? stats : null;
    } catch (error) {
        console.error('Error fetching stats from Firebase:', error);
        return null;
    }
}

export async function saveStats(statsArray) {
    try {
        const batchStats = statsArray.map((stat, idx) => ({ ...stat, sort_order: idx }));

        const q = query(collection(db, "stats"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((d) => { deletePromises.push(deleteDoc(doc(db, "stats", d.id))); });
        await Promise.all(deletePromises);

        const insertPromises = batchStats.map(stat => {
            const docRef = stat.id ? doc(db, "stats", String(stat.id)) : doc(collection(db, "stats"));
            return setDoc(docRef, { ...stat, id: docRef.id });
        });
        await Promise.all(insertPromises);
    } catch (error) {
        console.error('Error saving stats to Firebase:', error);
        throw error;
    }
}

// --- CONTACT INFO ---
export async function fetchContactInfo() {
    try {
        const q = query(collection(db, "contact_info"), orderBy("sort_order"));
        const querySnapshot = await getDocs(q);
        const contacts = [];
        querySnapshot.forEach((doc) => { contacts.push(doc.data()); });
        return contacts.length > 0 ? contacts : null;
    } catch (error) {
        console.error('Error fetching contact info from Firebase:', error);
        return null;
    }
}

export async function saveContactInfo(contactsArray) {
    try {
        const batchContacts = contactsArray.map((contact, idx) => ({ ...contact, sort_order: idx }));

        const q = query(collection(db, "contact_info"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((d) => { deletePromises.push(deleteDoc(doc(db, "contact_info", d.id))); });
        await Promise.all(deletePromises);

        const insertPromises = batchContacts.map(contact => {
            const docRef = contact.id ? doc(db, "contact_info", String(contact.id)) : doc(collection(db, "contact_info"));
            return setDoc(docRef, { ...contact, id: docRef.id });
        });
        await Promise.all(insertPromises);
    } catch (error) {
        console.error('Error saving contact info to Firebase:', error);
        throw error;
    }
}

// --- OFFERS & NEWS ---
export async function fetchOffers() {
    try {
        const q = query(collection(db, "offers_news"), orderBy("sort_order"));
        const querySnapshot = await getDocs(q);
        const offers = [];
        querySnapshot.forEach((doc) => { offers.push(doc.data()); });
        return offers;
    } catch (error) {
        console.error('Error fetching offers from Firebase:', error);
        return null;
    }
}

export async function saveOffers(offersArray) {
    try {
        const batchOffers = offersArray.map((offer, idx) => ({ ...offer, sort_order: idx }));

        const q = query(collection(db, "offers_news"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((d) => { deletePromises.push(deleteDoc(doc(db, "offers_news", d.id))); });
        await Promise.all(deletePromises);

        const insertPromises = batchOffers.map(offer => {
            const docRef = offer.id ? doc(db, "offers_news", String(offer.id)) : doc(collection(db, "offers_news"));
            return setDoc(docRef, { ...offer, id: docRef.id });
        });
        await Promise.all(insertPromises);
    } catch (error) {
        console.error('Error saving offers to Firebase:', error);
        throw error;
    }
}

// --- TOURNAMENTS ---
export async function fetchTournaments() {
    try {
        const q = query(collection(db, "tournaments"), orderBy("sort_order"));
        const querySnapshot = await getDocs(q);
        const tournaments = [];
        querySnapshot.forEach((doc) => { tournaments.push(doc.data()); });
        return tournaments.length > 0 ? tournaments : null;
    } catch (error) {
        console.error('Error fetching tournaments from Firebase:', error);
        return null;
    }
}

export async function saveTournaments(tournamentsArray) {
    try {
        const batchTournaments = tournamentsArray.map((tournament, idx) => ({ ...tournament, sort_order: idx }));

        const q = query(collection(db, "tournaments"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((d) => { deletePromises.push(deleteDoc(doc(db, "tournaments", d.id))); });
        await Promise.all(deletePromises);

        const insertPromises = batchTournaments.map(tournament => {
            const docRef = tournament.id ? doc(db, "tournaments", String(tournament.id)) : doc(collection(db, "tournaments"));
            return setDoc(docRef, { ...tournament, id: docRef.id });
        });
        await Promise.all(insertPromises);
    } catch (error) {
        console.error('Error saving tournaments to Firebase:', error);
        throw error;
    }
}
