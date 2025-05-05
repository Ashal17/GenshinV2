const const_artifact_types = ["flower", "plume", "sands", "goblet", "circlet"];
const const_artifact_max_levels = [0, 4, 4, 12, 16, 20];
const const_artifact_sub_stats = 4;
const const_artifact_sub_stats_options = ["blank", "atk", "atk%", "hp", "hp%", "def", "def%", "crit", "critdmg", "elemastery", "recharge"];

const const_party_size = 4;
const const_level_list = ["1", "20", "20+", "40", "40+", "50", "50+", "60", "60+", "70", "70+", "80", "80+", "90"];
const const_level_list_values = [1, 20, 20, 40, 40, 50, 50, 60, 60, 70, 70, 80, 80, 90];
const const_constel_list = [0, 1, 2, 3, 4, 5, 6];
const const_character_visions = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"];
const const_stats_visions = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "physical", "healing"];

const const_effect_types = ["character", "party", "manual"];
const const_effect_types_auto = ["character", "party"];

const const_enka_stats_transform_table = {
    "FIGHT_PROP_ATTACK": "atk",
    "FIGHT_PROP_ATTACK_PERCENT": "atk%",
    "FIGHT_PROP_DEFENSE": "def",
    "FIGHT_PROP_DEFENSE_PERCENT": "def%",
    "FIGHT_PROP_HP": "hp",
    "FIGHT_PROP_HP_PERCENT": "hp%",
    "FIGHT_PROP_CRITICAL": "crit",
    "FIGHT_PROP_CRITICAL_HURT": "critdmg",
    "FIGHT_PROP_CHARGE_EFFICIENCY": "recharge",
    "FIGHT_PROP_ELEMENT_MASTERY": "elemastery",
    "FIGHT_PROP_WIND_ADD_HURT": "anemo",
    "FIGHT_PROP_ICE_ADD_HURT": "cryo",
    "FIGHT_PROP_GRASS_ADD_HURT": "dendro",
    "FIGHT_PROP_ELEC_ADD_HURT": "electro",
    "FIGHT_PROP_ROCK_ADD_HURT": "geo",
    "FIGHT_PROP_WATER_ADD_HURT": "hydro",
    "FIGHT_PROP_FIRE_ADD_HURT": "pyro",
    "FIGHT_PROP_PHYSICAL_ADD_HURT": "physical",
    "FIGHT_PROP_HEAL_ADD": "healing"
}

const const_enka_stats_display_table = {
    "2000": "hp",
    "2001": "atk",
    "2002": "def",
    "20": "crit",
    "22": "critdmg",
    "23": "recharge",
    "28": "elemastery",
    "44": "anemo",
    "46": "cryo",
    "43": "dendro",
    "41": "electro",
    "45": "geo",
    "42": "hydro",
    "40": "pyro",
    "30": "physical",
    "26": "healing"
}

const const_reaction_damage_values = {
    "elemasteryadd": [17.17, 80.58, 80.58, 207.38, 207.38, 323.6, 323.6, 492.88, 492.88, 765.64, 765.64, 1110.0, 1110.0, 1446.85],
    "elemasterybonus": [17.17, 80.58, 80.58, 207.38, 207.38, 323.6, 323.6, 492.88, 492.88, 765.64, 765.64, 1110.0, 1110.0, 1446.85],
    "elemasterycrystalize": [91.18, 303.83, 303.83, 585.00, 585.00, 786.79, 786.79, 1030.08, 1030.08, 1314.75, 1314.75, 1596.81, 1596.81, 1851.06]
}

const const_bonusdmg_visions = ["all", "anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "physical"];
const const_bonusdmg_types = ["all", "normal", "charged", "plunge", "skill", "burst"];

const const_output_party_stat_objects = {
    "total": ["basic", "environment", "weapon", "artifacts", "effects"]
}

const const_display_stats_columns = [
    {
        "main": "atk",
        "stats": ["atk", "atk_base", "atk%"]
    },
    {
        "main": "hp",
        "stats": ["hp", "hp_base", "hp%"]
    },
    {
        "main": "def",
        "stats": ["def", "def_base", "def%"]
    },
    {
        "main": "recharge",
        "stats": ["recharge", "cdr", "mspeed", "aspeed", "healing", "healinginc", "shield"]
    },
    {
        "main": "crit",
        "stats": ["crit", "critnormal", "critcharged", "critplunge", "critskill", "critburst", "critanemo", "crithydro", "critpyro", "critcryo", "critgeo", "critelectro", "critdendro", "critphysical"]
    },
    {
        "main": "critdmg",
        "stats": ["critdmg", "critdmgnormal", "critdmgcharged", "critdmgplunge", "critdmgskill", "critdmgburst", "critdmganemo", "critdmghydro", "critdmgpyro", "critdmgcryo", "critdmggeo", "critdmgelectro", "critdmgdendro", "critdmgphysical"]
    },
    {
        "main": "elemastery",
        "stats": ["elemastery", "melt", "vaporize", "overload", "burning", "electrocharged", "superconduct", "shatter", "swirl", "rupture", "burgeon", "hyperbloom", "aggravate", "spread", "crystalize"]
    },
    {
        "main": ["anemo", "hydro", "pyro", "cryo", "geo", "electro", "dendro", "physical"],
        "default": "vision_auto",
        "stats": ["anemo", "hydro", "pyro", "cryo", "geo", "electro", "dendro", "physical", "normal", "charged", "plunge", "skill", "burst", "all"]
    }
]

const const_display_stats_units = {
    "enemy": [
        "enemydef", "enemyanemores", "enemyhydrores", "enemypyrores", "enemycryores", "enemyred", "enemygeores", "enemyelectrores", "enemydendrores", "enemyphysicalres"
    ],
    "party": [
        "atk", "hp", "def", "recharge", "crit", "critdmg", "elemastery", "vision_auto"
    ]
}

const const_display_stats_calculate = [
    "atk",
    "atk_base",
    "atk_base_mid",
    "atk%",
    "hp",
    "hp_base",
    "hp_base_mid",
    "hp%",
    "def",
    "def_base",
    "def_base_mid",
    "def%",
    "crit",
    "critdmg",
    "elemastery",
    "recharge",
    "physical",
    "elemental",
    "anemo",
    "hydro",
    "pyro",
    "cryo",
    "geo",
    "electro",
    "dendro",
    "healing"
]

const const_display_stats_storage = [
    "atk", "hp", "def", "crit", "critdmg", "elemastery", "recharge"
]

const const_bonusdmg_names = {
    "normal": "Normal Attack",
    "charged": "Charged Attack",
    "plunge": "Plunging Attack",
    "skill": "Elemental Skill",
    "burst": "Elemental Burst"
}

const const_attack_level_types = ["normal", "skill", "burst"]

const const_weapon_types = ["bow", "catalyst", "claymore", "polearm", "sword"];
const const_refine_list = [1, 2, 3, 4, 5];
const const_weapon_max_levels = [0, 9, 9, 13, 13, 13];

const const_legacy_artifact_substats_bitsize = {
    "blank": 1,
    "atk": 7,
    "atk%": 9,
    "hp": 11,
    "hp%": 9,
    "def": 8,
    "def%": 9,
    "crit": 8,
    "critdmg": 9,
    "elemastery": 8,
    "recharge": 9
}

const const_legacy_setup_local_storage = [
    "name",
    "character",
    "skill",
    "url",
    "comparison",
    "warning"
]