



keepContains = [ "selectWorld.gameMode.spectator", "deathScreen.message", "deathScreen.respawn", "deathScreen.title" ]
def keepLine(line):
    for pattern in keepContains:
        if pattern in line:
            return True
    return False

def reduce(name):
    keep = []
    with open(name, mode="r", encoding="utf-8") as f:
        for i in f.readlines():
            if keepLine(i):
                keep.append(i)
    
    with open(name, mode="w", encoding="utf-8") as f:
        f.write("".join(keep))

files = [
  "en_US",
  "en_GB",
  "de_DE",
  "es_ES",
  "es_MX",
  "fr_FR",
  "fr_CA",
  "it_IT",
  "ja_JP",
  "ko_KR",
  "pt_BR",
  "pt_PT",
  "ru_RU",
  "zh_CN",
  "zh_TW",
"nl_NL",
"bg_BG",
"cs_CZ",
"da_DK",
"el_GR",
"fi_FI",
"hu_HU",
"id_ID",
"nb_NO",
"pl_PL",
"sk_SK",
"sv_SE",
"tr_TR",
"uk_UA"
]
for file in files:  
    reduce(file + ".lang")