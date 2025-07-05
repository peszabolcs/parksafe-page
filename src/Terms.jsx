import "./Terms.css";

function Terms() {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="terms-header">
          <h1>📋 Általános Szerződési Feltételek</h1>
          <p className="last-updated">Utolsó frissítés: 2025. január 5.</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Általános rendelkezések</h2>
            <p>
              Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a ParkSafe Kft. (székhely: 1051 Budapest, Október 6. utca 12.; 
              cégjegyzékszám: 01-09-123456; adószám: 12345678-2-41) által üzemeltetett ParkSafe alkalmazás és szolgáltatások 
              használatára vonatkoznak.
            </p>
            <p>
              Az alkalmazás használatával Ön elfogadja jelen ÁSZF-ben foglalt feltételeket. Kérjük, hogy a regisztráció előtt 
              figyelmesen olvassa el az alábbi feltételeket.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. A szolgáltatás leírása</h2>
            <p>
              A ParkSafe egy mobilalkalmazás és webes platform, amely segít a felhasználóknak biztonságos kerékpár- és 
              roller-tárolóhelyek megtalálásában. A szolgáltatás keretében a következő funkciókat biztosítjuk:
            </p>
            <ul>
              <li>Tárolóhelyek térképes megjelenítése</li>
              <li>Valós idejű elérhetőségi információk</li>
              <li>Közösségi értékelések és vélemények</li>
              <li>Biztonsági információk és kamerarendszer adatok</li>
              <li>Szerviz- és kiegészítő szolgáltatások keresése</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Regisztráció és felhasználói fiók</h2>
            <p>
              A szolgáltatás teljes körű használatához regisztráció szükséges. A regisztráció során megadott adatok 
              valódiságáért a felhasználó felel. A felhasználó köteles:
            </p>
            <ul>
              <li>Valós adatokat megadni a regisztráció során</li>
              <li>Fiókadatait biztonságban tartani</li>
              <li>Jelszavát rendszeresen megváltoztatni</li>
              <li>Haladéktalanul jelenteni bármilyen visszaélést</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Díjak és fizetés</h2>
            <p>
              Az alkalmazás alapfunkciói ingyenesen használhatók. A prémium szolgáltatásokért havonta 990 Ft díjat számítunk fel. 
              A díjfizetés automatikus megújítással történik, amelyet a felhasználó bármikor lemondhat.
            </p>
            <p>
              Az első hónapban a prémium szolgáltatások ingyenesen kipróbálhatók. A lemondás elmulasztása esetén 
              automatikusan megújul a prémium előfizetés.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Adatvédelem</h2>
            <p>
              A személyes adatok kezelésére vonatkozó információkat részletesen az Adatvédelmi Tájékoztatónkban találja. 
              A regisztrációval Ön hozzájárul adatainak az ott leírt módon történő kezeléséhez.
            </p>
            <p>
              Az alkalmazás használata során gyűjtött helyadatok kizárólag a szolgáltatás nyújtásához szükséges 
              mértékben kerülnek felhasználásra.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Szellemi tulajdonjogok</h2>
            <p>
              Az alkalmazás és annak tartalma (szoftver, grafika, szövegek, adatbázis) a ParkSafe Kft. szellemi 
              tulajdonát képezi. A felhasználó kizárólag a szolgáltatás rendeltetésszerű használatára jogosult.
            </p>
            <p>
              Tilos az alkalmazás tartalmának másolása, terjesztése, módosítása vagy kereskedelmi célú felhasználása 
              a ParkSafe Kft. írásos engedélye nélkül.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Felelősség korlátozása</h2>
            <p>
              A ParkSafe Kft. nem vállal felelősséget a tárolóhelyek tényleges biztonságáért vagy elérhetőségéért. 
              Az alkalmazásban megjelenő információk tájékoztató jellegűek.
            </p>
            <p>
              A társaság nem felel a felhasználó által a tárolóhelyeken elszenvedett károkért, lopásokért vagy 
              bármilyen egyéb veszteségért.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Közösségi tartalmak</h2>
            <p>
              A felhasználók által közzétett értékelések, vélemények és egyéb tartalmak szerzői jogaiért a 
              feltöltő felhasználó felel. A társaság fenntartja a jogot a nem megfelelő tartalmak eltávolítására.
            </p>
            <p>
              Tilos trágár, sértő, jogellenes vagy valótlan tartalmak közzététele. Az ilyen tartalmak 
              közzétevőjének fiókját felfüggesztjük.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Szolgáltatás felfüggesztése</h2>
            <p>
              A ParkSafe Kft. fenntartja a jogot a szolgáltatás ideiglenes vagy végleges felfüggesztésére 
              karbantartás, fejlesztés vagy egyéb műszaki okok miatt.
            </p>
            <p>
              Súlyos szerződésszegés esetén a társaság jogosult a felhasználói fiók azonnali felfüggesztésére 
              vagy törlésére előzetes értesítés nélkül.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Jogviták rendezése</h2>
            <p>
              A jelen ÁSZF-fel kapcsolatos jogviták rendezésére a magyar jog irányadó. A felek elsősorban 
              békés úton kísérlik meg rendezni a vitákat.
            </p>
            <p>
              Amennyiben a békés rendezés nem vezet eredményre, a jogviták elbírálására a Budapesti Törvényszék 
              kizárólagosan illetékes.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Az ÁSZF módosítása</h2>
            <p>
              A ParkSafe Kft. fenntartja a jogot jelen ÁSZF egyoldalú módosítására. A módosításokról a 
              felhasználókat e-mail útján vagy az alkalmazásban megjelenő értesítéssel tájékoztatjuk.
            </p>
            <p>
              A módosítások a közléstől számított 15 napon belül lépnek hatályba. A szolgáltatás további 
              használatával a felhasználó elfogadja a módosított feltételeket.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Kapcsolat</h2>
            <p>
              Jelen ÁSZF-fel kapcsolatos kérdésekkel, panaszokkal a következő elérhetőségeken fordulhat hozzánk:
            </p>
            <ul>
              <li>E-mail: hello@parksafe.hu</li>
              <li>Postai cím: 1051 Budapest, Október 6. utca 12.</li>
              <li>Telefonos ügyfélszolgálat: +36 1 234 5678</li>
            </ul>
          </section>
        </div>

        <div className="terms-footer">
          <p>
            <strong>Hatályos:</strong> 2025. január 5-től<br />
            <strong>ParkSafe Kft.</strong> • 1051 Budapest, Október 6. utca 12. • hello@parksafe.hu
          </p>
        </div>
      </div>
    </div>
  );
}

export default Terms;