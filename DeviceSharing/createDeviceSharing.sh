#!/bin/bash
# WEDA 2024-01-17 JKru
# Erzeugen einer PDF-Datei mit einem Link als klickbarem Link 
# und dem Link als QR-Code für das Handy zum Desktop-Sharing 
# ueber MeshCentral.
VERSION='WeDa $Version: 000$.$Rev:        $ $Date::                             #$'
if [ "$1" = "--version" ]; then
  echo "$VERSION"
  exit 0
fi

function usage {
  echo "Usage: $0 deviceId FabrikNr \"Adresse\" Email \"Bemerkungen\" GueltigkeitTage"
}

if [ $# -lt 6 ]; then
  usage
  exit 1
fi

deviceId="$1"
fabrikNr="$2"
adresse="$3"
email="$4"
bemerkung="$5"
gueltigkeitTage="$6"

set -euo pipefail #https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/

# Erzeugen einer PDF-Datei aus einer PS-Datei mit GhostScript. 
# Ersatz fuer das Script ps2pdf, das bei ps2pdf die Groesse des PDF-Dokuments fest A4 ist.
# Parameter: Name der PS-Datei ohne die Endung .ps. Erzeugt wird eine Datei gleichen Namens mit der Endung .pdf.
function myPs2pdf {
  fileName=$1
  sizeInPoints=$( grep '%%BoundingBox' ${fileName}.ps | cut -d' ' -f 4 ) #Groesse aus dem Header der PS-Datei ermitteln.
  pointsPerInch=72
  gs -q -sOutputFile=${fileName}.pdf -dNOPAUSE -dBATCH -g${sizeInPoints}x${sizeInPoints} -r${pointsPerInch} -sDEVICE=pdfwrite -dSAFER ${fileName}.ps
}

currentDate=$(date "+%d.%m.%Y")
endDate=$(date "+%Y-%m-%d" --date="+${gueltigkeitTage} days")
qrCodeFileName="WEDA_RemoteControl_${fabrikNr}_bis_${endDate}"

cd "$(dirname "$0")"
echo "$*" > aufruf.txt

# Mit meshctl wird der Device Sharing Link erzeugt. Rueckgabe: "ID: [irgendeine ID]\nURL: [URL]"
url=$(./meshctl devicesharing --id $deviceId --add "$fabrikNr" --end "${endDate}T23:59:59" --type desktop)
if ! [[ "$url" == *"URL"* ]]; then
  echo "Sharing Link konnte nicht erzeugt werden: $url"
  exit 1
fi
rm ./WEDA_RemoteControl*
url="https:"$( echo $url | sed "s/.*https://" ) #URL aus dem Rueckgabestring isolieren.
echo "devId: $deviceId URL: $url"
qrencode -o qrCode.ps -l H -t EPS "$url"
myPs2pdf qrCode
url=$( echo $url | sed  's/\//\\\//g' ) #https:// -> die beiden // gegen \/\/ tauschen (escapen).

# Informationen in das Template-File eintragen und mit pdfmom daraus ein PDF erzeugen.
# Infos zu pdfmom: https://www.teuderun.de/groff/
sed -e "s/#fabriknr#/$fabrikNr/g" \
    -e "s/#date#/$currentDate/g" \
    -e "s/#enddate#/$endDate/g" \
    -e "s/#adresse#/$adresse/g" \
    -e "s/#bemerkung#/$bemerkung/g" \
    -e "s/#email#/$email/g" \
    -e "s/#url#/$url/g" qrcodeTemplate.mom |
pdfmom -mden -Kutf8 - > ${qrCodeFileName}.pdf 