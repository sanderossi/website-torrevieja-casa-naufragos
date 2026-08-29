# Website Torrevieja Casa Náufragos

Migratie van de oorspronkelijke Manus-site naar Vercel.

De Vercel-build kopieert de oorspronkelijke front-end assets tijdens de build naar `dist`, past het contactformulier aan naar `/api/inquiry`, en draait daarna volledig vanaf Vercel. Het formulier verstuurt via Gmail naar de ingestelde verhuurdersadressen. Geheime Gmail-gegevens staan uitsluitend in Vercel Environment Variables en niet in deze repository.
