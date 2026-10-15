"""sitemap.xml dosyasını sabit sayfalar + Firestore'daki tüm projelerle yeniden oluşturur.

Yeni proje eklendiğinde bir kez çalıştırıp sitemap.xml'i yayına almak yeterli:
    python scripts/sitemap-olustur.py
"""
import json
import os
import urllib.request
from xml.sax.saxutils import escape

SITE = "https://aksismuhendislik.com"
API_KEY = "AIzaSyAwJD6tm7J_ULD-DE07kxbv_dplSqfj8aA"  # Firebase web key (herkese açık, domain kısıtlı)
FIRESTORE = ("https://firestore.googleapis.com/v1/projects/aksis-website-f5868/databases/(default)"
             "/documents/projects?pageSize=300&key=" + API_KEY)

SABIT_SAYFALAR = [
    ("/", "1.0"),
    ("/hizmetlerimiz.html", "0.9"),
    ("/hakkimizda.html", "0.8"),
    ("/projeler.html?kategori=tamamlandi", "0.8"),
    ("/projeler.html?kategori=devam_ediyor", "0.7"),
]


def projeleri_getir():
    ids, url = [], FIRESTORE
    while url:
        # API key sadece kendi domainimizden gelen isteklere izin veriyor
        req = urllib.request.Request(url, headers={"Referer": SITE + "/"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
        ids += [d["name"].rsplit("/", 1)[-1] for d in data.get("documents", [])]
        token = data.get("nextPageToken")
        url = FIRESTORE + "&pageToken=" + token if token else None
    return ids


def main():
    satirlar = ['<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for yol, oncelik in SABIT_SAYFALAR:
        satirlar.append(f"  <url><loc>{escape(SITE + yol)}</loc><priority>{oncelik}</priority></url>")
    projeler = projeleri_getir()
    for pid in projeler:
        satirlar.append(f"  <url><loc>{escape(SITE + '/proje-detay.html?id=' + pid)}</loc><priority>0.6</priority></url>")
    satirlar.append("</urlset>")

    hedef = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sitemap.xml")
    with open(hedef, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(satirlar) + "\n")
    print(f"sitemap.xml yazıldı: {len(SABIT_SAYFALAR)} sayfa + {len(projeler)} proje")


if __name__ == "__main__":
    main()
