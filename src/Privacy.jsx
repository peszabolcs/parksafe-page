import React from "react";
import "./Privacy.css";

export default function Privacy() {
  return (
    <div className="privacy-page">
      <div className="container">
        <div className="privacy-header">
          <h1>🔒 Adatvédelmi Szabályzat</h1>
          <p className="last-updated">Utolsó frissítés: 2025. augusztus 8.</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Általános információk</h2>
            <p>
              Jelen Adatvédelmi Szabályzat a ParkSafe alkalmazással és
              weboldalával kapcsolatos adatkezelési gyakorlatainkat ismerteti.
              Az adatkezelő a <strong>Premiumtex Kft.</strong>
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Adatkezelő elérhetősége</h2>
            <div className="contact-info">
              <p>
                <strong>Cégnév:</strong> Premiumtex Kft.
              </p>
              <p>
                <strong>Székhely:</strong> 6792 Zsombó, Dózsa d. 55
              </p>
              <p>
                <strong>E-mail:</strong> perjesidev@gmail.com
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>3. Kezelt személyes adatok</h2>
            <p>
              Weboldalunkon keresztül kizárólag az alábbi személyes adatokat
              kezeljük:
            </p>
            <ul>
              <li>
                <strong>E-mail cím:</strong> Hírlevelünkre való feliratkozás
                esetén
              </li>
              <li>
                <strong>Kapcsolatfelvételi adatok:</strong> A kapcsolatfelvételi
                űrlap kitöltése esetén (név, e-mail, üzenet)
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Adatkezelés célja és jogalapja</h2>
            <div className="data-purpose">
              <h3>4.1 Hírlevél feliratkozás</h3>
              <p>
                <strong>Cél:</strong> Tájékoztatás nyújtása a ParkSafe
                alkalmazással kapcsolatos újdonságokról és fejlesztésekről.
              </p>
              <p>
                <strong>Jogalap:</strong> Az érintett önkéntes hozzájárulása
                (GDPR 6. cikk (1) bekezdés a) pont)
              </p>

              <h3>4.2 Kapcsolatfelvétel</h3>
              <p>
                <strong>Cél:</strong> A felhasználók kérdéseinek megválaszolása,
                támogatás nyújtása.
              </p>
              <p>
                <strong>Jogalap:</strong> Jogos érdek (GDPR 6. cikk (1) bekezdés
                f) pont)
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>5. Adatok felhasználása</h2>
            <p>
              <strong>
                Kifejezetten kijelentjük, hogy személyes adatait kizárólag
                azonosítás és kommunikáció céljából használjuk fel.
              </strong>
              Adatait nem használjuk fel marketing célokra a hírlevél küldésén
              kívül, nem készítünk profilt Önről, és nem végzünk automatizált
              döntéshozatalt.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Adatok továbbítása harmadik fél részére</h2>
            <p>
              <strong>
                Személyes adatait harmadik fél részére nem továbbítjuk, nem
                adjuk ki, és nem értékesítjük.
              </strong>
              Az adatok kizárólag saját rendszereinkben kerülnek tárolásra és
              feldolgozásra.
            </p>
            <p>
              Kivétel: Jogszabály által előírt esetekben (pl. hatósági
              megkeresés) kötelezettek vagyunk az adatok átadására a
              jogszabályban meghatározott szerveknek.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Adatok tárolásának időtartama</h2>
            <ul>
              <li>
                <strong>Hírlevél feliratkozás:</strong> A feliratkozás
                visszavonásáig vagy a szolgáltatás megszűnéséig
              </li>
              <li>
                <strong>Kapcsolatfelvételi adatok:</strong> A megkeresés
                lezárásától számított 1 évig
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>8. Az érintettek jogai</h2>
            <p>A GDPR alapján Önnek joga van:</p>
            <ul>
              <li>
                <strong>Tájékoztatáshoz:</strong> Információt kérni az
                adatkezelésről
              </li>
              <li>
                <strong>Hozzáféréshez:</strong> Betekinteni a kezelt személyes
                adataiba
              </li>
              <li>
                <strong>Helyesbítéshez:</strong> Kérni az adatok javítását
              </li>
              <li>
                <strong>Törléshez:</strong> Kérni az adatok törlését
              </li>
              <li>
                <strong>Korlátozáshoz:</strong> Kérni az adatkezelés
                korlátozását
              </li>
              <li>
                <strong>Hordozhatósághoz:</strong> Kérni az adatok átadását
              </li>
              <li>
                <strong>Tiltakozáshoz:</strong> Tiltakozni az adatkezelés ellen
              </li>
            </ul>
            <p>
              Jogai gyakorlására vonatkozó kérelmét az{" "}
              <strong>perjesidev@gmail.com</strong> e-mail címre küldheti el.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Adatbiztonság</h2>
            <p>
              Megfelelő technikai és szervezési intézkedéseket tettünk az adatok
              biztonságának megőrzése érdekében. Az adatok tárolása titkosított
              kapcsolaton keresztül, biztonságos szervereken történik.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Sütik (Cookies)</h2>
            <p>
              Weboldalunk alapvető működéséhez szükséges sütiket használ.
              Analitikai célú sütiket csak az Ön hozzájárulásával használunk. A
              sütik kezelésére vonatkozó részletes tájékoztatást külön Süti
              Szabályzatunkban találja.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Kapcsolat és panasztétel</h2>
            <p>
              Adatvédelmi kérdéseivel, panaszaival fordulhat hozzánk az alábbi
              elérhetőségeken:
            </p>
            <div className="contact-info">
              <p>
                <strong>E-mail:</strong> perjesidev@gmail.com
              </p>
              <p>
                <strong>Postai cím:</strong> 6792 Zsombó, Dózsa d. 55
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>12. Módosítások</h2>
            <p>
              Fenntartjuk a jogot jelen Adatvédelmi Szabályzat módosítására. A
              módosításokról weboldalunkon keresztül tájékoztatjuk
              felhasználóinkat.
            </p>
          </section>
        </div>

        <div className="privacy-footer">
          <p>
            <strong>Hatályos:</strong> 2025. augusztus 8-tól
            <br />
            <strong>Premiumtex Kft.</strong> • 6792 Zsombó, Dózsa d. 55 •
            perjesidev@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
