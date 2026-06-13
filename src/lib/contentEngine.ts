// Programmatic Content Engine - Rhône (69) - Borne de Recharge
// Generates highly unique, localized, helpful content for each commune in the Rhône department.
// Uses a multi-dimensional sentence-level spintax matrix to avoid duplicate content penalties
// and provides rich technical details (E-E-A-T) optimized for local search queries in 69.

import { getNearbyCommunes } from './geoLinks';
import communes from '../data/communes.json';

export function spin(text: string, seed: string): string {
  let result = text;
  const spintaxRegex = /{([^{}|]+\|[^{}]+)}/g;
  
  while (spintaxRegex.test(result)) {
    result = result.replace(spintaxRegex, (match, choicesStr) => {
      if (['VILLE', 'CODE_POSTAL', 'PRIX_MIN', 'PRIX_MAX', 'VARIANTE_INTRO'].includes(choicesStr)) {
        return match;
      }
      const choices = choicesStr.split('|');
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
      }
      hash = hash + choicesStr.length;
      const index = Math.abs(hash) % choices.length;
      return choices[index];
    });
  }
  return result;
}

export interface Commune {
  nom: string;
  slug: string;
  codeInsee: string;
  codePostal: string;
  population: number;
  altitude?: number;
  prixM2Moyen?: number;
  logements?: number;
  logementsMaison?: number;
  vehiculesElectriques?: number;
  croissanceVE?: number;
  bornesPubliques?: number;
  intercommunalite?: string;
  canton?: string;
  latitude?: number;
  longitude?: number;
  distanceLyon?: number;
  densiteBornes?: number;
  profilCommune?: string;
  marcheImmobilier?: string;
  tauxMaisonLabel?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  description: string;
}

export interface GuideLink {
  href: string;
  label: string;
  desc: string;
}

export interface LocalContent {
  introParagraph: string;
  logisticsAlert: string;
  useCaseText: string;
  pricesContext: string;
  faqItems: { question: string; answer: string }[];
  ecoText: string;
  localContext: string;
  climateZoneLabel: string;
  localAgencyName: string;
  externalLinks: ExternalLink[];
  communeDataInsight: string;
  expertTip: string;
  tableIntro: string;
  guideLinks: GuideLink[];
  savingsEstimate: string;
  lastUpdated: string;
  realEstateInsight: string;
  populationTierContent: string;
  // New dynamic SEO fields
  densiteAnalysis: string;
  marcheImmobilierInsight: string;
  distanceLyonContext: string;
  localRegulation: string;
  sourcesCitation: string;
}

export type ClimateZone = 'grand-lyon' | 'beaujolais-saone' | 'ouest-lyonnais-monts';

const CATEGORY_OFFSETS: Record<string, number> = {
  main: 0,
  copropriete: 100,
  wallbox: 200
};

export function getClimateZone(codePostal: string, slug: string): ClimateZone {
  const cp = codePostal.trim();
  
  // Grand Lyon
  const grandLyonSlugs = new Set([
    'lyon', 'villeurbanne', 'venissieux', 'vaulx-en-velin', 'saint-priest', 'caluire-et-cuire',
    'bron', 'meyzieu', 'rillieux-la-pape', 'decines-charpieu', 'oullins-pierre-benite', 'oullins',
    'sainte-foy-les-lyon', 'saint-genis-laval', 'givors', 'ecully', 'tassin-la-demi-lune',
    'saint-fons', 'francheville', 'craponne', 'corbas', 'chassieu', 'feyzin', 'saint-priest',
    'irigny', 'dardilly', 'mions', 'neuville-sur-saone', 'fontaines-sur-saone', 'grigny'
  ]);
  
  if (grandLyonSlugs.has(slug) || cp.startsWith('6900') || cp.startsWith('69100') || cp.startsWith('69120') || cp.startsWith('69200') || cp.startsWith('69300') || cp.startsWith('69500') || cp.startsWith('69690') || cp.startsWith('69330') || cp.startsWith('69680')) {
    return 'grand-lyon';
  }
  
  // Beaujolais & Saône
  if (cp.startsWith('69400') || cp.startsWith('69220') || slug === 'villefranche-sur-saone' || slug === 'belleville-en-beaujolais' || slug === 'gleize') {
    return 'beaujolais-saone';
  }
  
  return 'ouest-lyonnais-monts';
}

export function getLocalAgency(codePostal: string, slug: string): { name: string; detail: string; website: string } {
  const zone = getClimateZone(codePostal, slug);
  if (zone === 'grand-lyon') {
    return {
      name: "l'ALEC Lyon (Agence Locale de l'Énergie et du Climat de la Métropole de Lyon)",
      detail: "le guichet d'information de la Métropole pour la transition énergétique",
      website: "alec-lyon.org"
    };
  }
  return {
    name: "l'Espace Conseil France Rénov' du Rhône (animé par l'ADIL 69)",
    detail: "l'Espace Conseil Info Énergie du département du Rhône",
    website: "adil69.org"
  };
}

export function getVariantIndex(slug: string, offset: number, maxVariants: number): number {
  let hash = offset * 31;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % maxVariants;
}

export function getDynamicPrices(commune: Commune) {
  const priceFactor = commune.population > 100000 || ['ecully', 'saint-didier-au-mont-d-or', 'lyon', 'tassin-la-demi-lune'].includes(commune.slug) ? 1.06 : commune.population > 25000 ? 1.02 : 0.98;
  return {
    greenUp: { min: Math.round(390 * priceFactor), max: Math.round(720 * priceFactor) },
    wallbox7kW: { min: Math.round(1250 * priceFactor), max: Math.round(1850 * priceFactor) },
    wallbox11kW: { min: Math.round(1550 * priceFactor), max: Math.round(2300 * priceFactor) },
    wallbox22kW: { min: Math.round(2100 * priceFactor), max: Math.round(3600 * priceFactor) },
    copro: { min: Math.round(2700 * priceFactor), max: Math.round(4800 * priceFactor) },
    triUpgrade: { min: Math.round(490 * priceFactor), max: Math.round(1250 * priceFactor) },
    priceFactor
  };
}

function getExternalLinks(category: string, codePostal: string, slug: string): ExternalLink[] {
  const agency = getLocalAgency(codePostal, slug);
  const agencyUrl = agency.website.startsWith('http') ? agency.website : `https://www.${agency.website}`;
  
  const base: ExternalLink[] = [
    {
      label: "Programme ADVENIR — Subventions Bornes de Recharge",
      url: "https://advenir.mobi",
      description: "Site officiel du programme ADVENIR détaillant les primes pour les particuliers, les syndics et les entreprises."
    },
    {
      label: `${agency.name} — Service Public local`,
      url: agencyUrl,
      description: "Accompagnement de proximité gratuit pour votre transition énergétique et aides financières dans le Rhône."
    },
    {
      label: "Annuaire des Électriciens qualifiés IRVE",
      url: "https://www.qualifelec.fr",
      description: "Vérifiez la qualification IRVE (Infrastructure de Recharge pour Véhicules Électriques) de votre électricien."
    }
  ];

  if (category === 'copropriete') {
    return [
      ...base,
      {
        label: "Légifrance — Décret n° 2020-1720 (Droit à la prise)",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042740927",
        description: "Texte de loi officiel régissant le droit à la prise pour la recharge des véhicules électriques en copropriété."
      },
      {
        label: "Métropole de Lyon — Aides aux copropriétés",
        url: "https://www.grandlyon.com",
        description: "Dispositifs locaux de subventions pour la rénovation et l'équipement des parkings de copropriété lyonnais."
      }
    ];
  } else if (category === 'wallbox') {
    return [
      ...base,
      {
        label: "Automobile Propre — Guide de la recharge à domicile",
        url: "https://www.automobile-propre.com",
        description: "Comparatifs indépendants, temps de charge et explications détaillées sur le fonctionnement des wallbox."
      },
      {
        label: "Data.gouv.fr — Carte des bornes publiques",
        url: "https://www.data.gouv.fr/fr/datasets/fichier-national-consolide-des-bornes-de-recharge-pour-vehicules-electriques-irve/",
        description: "Base de données nationale officielle recensant l'ensemble des points de recharge IRVE publics en France."
      }
    ];
  } else {
    // main
    return [
      ...base,
      {
        label: "Service-Public.fr — Crédit d'impôt Borne de recharge",
        url: "https://www.service-public.fr/particuliers/vosdroits/F35535",
        description: "Fiche officielle décrivant les conditions pour bénéficier du crédit d'impôt de 500 € en 2026."
      },
      {
        label: "Enedis — Raccordement borne de recharge",
        url: "https://www.enedis.fr/raccorder-une-borne-de-recharge-de-vehicule-electrique",
        description: "Guide du gestionnaire de réseau électrique sur les étapes de raccordement et d'augmentation de puissance."
      }
    ];
  }
}

function getGuideLinks(category: string): GuideLink[] {
  if (category === 'copropriete') {
    return [
      { href: '/guides/wallbox-copropriete-lyon-droit-prise/', label: 'Droit à la Prise Copro', desc: 'Comment installer votre borne en résidence collective à Lyon.' },
      { href: '/guides/aide-advenir-metropole-lyon-2026/', label: 'Aides Financières Lyon 2026', desc: "Cumuler ADVENIR, crédit d'impôt et aides locales de la métropole." },
      { href: '/guides/passage-triphase-enedis-rhone-tarifs/', label: 'Compteur Enedis Triphasé', desc: 'Raccorder sa borne en monophasé ou triphasé dans le 69.' }
    ];
  } else if (category === 'wallbox') {
    return [
      { href: '/guides/comparatif-marques-wallbox-2026/', label: 'Comparatif Wallbox 2026', desc: 'Le match des meilleures marques de bornes à domicile (Schneider, Legrand, Pulsar).' },
      { href: '/guides/smart-charging-delestage-dynamique-enedis-lyon/', label: 'Smart Charging & Heures Creuses', desc: 'Différences et temps de charge selon votre contrat Enedis.' },
      { href: '/guides/zfe-lyon-crit-air-borne-recharge-domicile/', label: 'ZFE Lyon & Mobilité Électrique', desc: 'Calendrier Crit\'Air Grand Lyon et nécessité d\'équiper son foyer.' }
    ];
  } else {
    // main
    return [
      { href: '/guides/prix-installation-borne-recharge-rhone-2026/', label: 'Prix Borne Rhône 2026', desc: 'Budget complet pour équiper votre maison dans le 69.' },
      { href: '/guides/zfe-lyon-crit-air-borne-recharge-domicile/', label: 'ZFE Grand Lyon 2026', desc: 'Comment la réglementation ZFE rend la borne indispensable.' },
      { href: '/guides/smart-charging-delestage-dynamique-enedis-lyon/', label: 'Délestage Dynamique Linky', desc: 'Gérer la charge de sa voiture électrique pour éviter les surcharges.' }
    ];
  }
}

// Spintax pools definition (Serious, technical, Lyon-tech tone)
const INTRO_POOLS: Record<string, string[]> = {
  main: [
    "Pour {l'installation|la pose} de votre borne de recharge à {VILLE}, {profitez|bénéficiez} d'une pose clés en main par nos techniciens certifiés IRVE. Nous réalisons une étude de conformité de votre tableau électrique pour garantir une charge {sûre|sécurisée} avec délestage dynamique Linky.",
    "Besoin d'installer une borne pour votre véhicule électrique à {VILLE} ? Nos installateurs locaux du Rhône vous accompagnent dans le choix d'une wallbox {adaptée|performante} de type P1/P2 et gèrent vos démarches d'aides financières ADVENIR.",
    "Sécurisez la charge de votre véhicule électrique à {VILLE} grâce à une wallbox {7.4 kW|11 kW} installée par un électricien IRVE agréé. Devis gratuit et visite technique sous {48h|deux jours} dans tout le 69.",
    "Avec le développement de la ZFE du Grand Lyon dans le Rhône, équiper sa maison de {VILLE} d'une borne de recharge rapide à domicile est la solution {idéale|optimale} pour charger à moindre coût et anticiper les interdictions.",
    "Vous habitez à {VILLE} et souhaitez passer à la vitesse supérieure pour votre voiture électrique ? Nos électriciens partenaires certifiés Qualifelec IRVE installent votre borne de recharge {à domicile|chez vous} en conformité avec la norme NF C 15-100.",
    "Recharger sa voiture sur une prise domestique standard à {VILLE} est {trop lent|inefficace} et risqué. Optez pour une installation de borne murale intelligente avec Smart Charging et protocole ISO 15118.",
    "Nos experts en solutions de recharge interviennent à {VILLE} pour dimensionner et poser votre wallbox. Bénéficiez des aides de l'État (TVA à 5,5% et crédit d'impôt de 500 €) avec nos {pros|artisans certifiés IRVE}.",
    "Profitez de l'expertise d'un installateur IRVE à {VILLE} pour raccorder votre wallbox intelligente. Nous configurons le délestage dynamique pour protéger l'installation électrique de votre {maison|logement} lors des pics de consommation."
  ],
  copropriete: [
    "Vous habitez en copropriété à {VILLE} et souhaitez installer une borne de recharge ? Le droit à la prise vous garantit la possibilité d'équiper votre place de parking à vos frais, avec le soutien des aides de la Métropole de Lyon.",
    "Installez votre borne de recharge en copropriété à {VILLE} en toute simplicité. Nos techniciens certifiés IRVE vous aident à formaliser votre demande auprès du syndic lyonnais et à obtenir jusqu'à 960 € de subvention ADVENIR.",
    "Le droit à la prise (décret 2020) permet à tout locataire ou propriétaire d'un appartement à {VILLE} d'installer un point de recharge sur son emplacement de stationnement. Découvrez nos infrastructures collectives certifiées.",
    "Sécurisez la recharge de votre voiture électrique dans votre résidence à {VILLE}. Nous concevons des installations individuelles ou collectives conformes aux exigences IRVE et éligibles aux primes ADVENIR 2026.",
    "Rendre votre copropriété à {VILLE} compatible avec la recharge électrique valorise l'ensemble des appartements. Nos experts IRVE interviennent pour installer des bornes individuelles raccordées au TGBT des parties communes.",
    "Le raccordement d'une borne en parking partagé ou sous-sol à {VILLE} requiert une expertise spécifique. Nous réalisons l'étude technique nécessaire pour présenter un dossier solide à votre syndic de copropriété.",
    "Faites installer votre wallbox dans votre résidence de {VILLE} en bénéficiant de la prime ADVENIR copropriété qui finance jusqu'à 50% du projet d'installation électrique individuelle.",
    "Nos électriciens certifiés IRVE dans le Rhône accompagnent les syndics et les copropriétaires de {VILLE} de l'étude de faisabilité technique jusqu'à la mise en service finale de la borne."
  ],
  wallbox: [
    "Optimisez la recharge de votre voiture électrique à {VILLE} en faisant installer une borne murale rapide (Wallbox) de 7.4 kW à 22 kW par nos électriciens certifiés IRVE du Rhône.",
    "Besoin d'une recharge rapide et intelligente à domicile à {VILLE} ? Découvrez nos modèles de Wallbox connectées avec gestion des heures creuses et délestage de puissance en temps réel.",
    "Installez une borne de recharge performante (Wallbox) dans votre maison à {VILLE}. Nous sélectionnons les meilleures marques du marché pour vous garantir une charge sécurisée, rapide et compatible protocole ISO 15118.",
    "La Wallbox est la solution de recharge résidentielle par excellence à {VILLE}. Elle permet de recharger votre véhicule électrique jusqu'à 8 fois plus vite qu'une prise de courant standard.",
    "Faites poser votre borne Wallbox à {VILLE} par un électricien agréé IRVE pour sécuriser votre installation électrique et bénéficier des aides financières de l'État en 2026.",
    "Vous cherchez à réduire le temps de charge de votre voiture électrique à {VILLE} ? Nos installateurs partenaires vous proposent des solutions Wallbox adaptées à votre abonnement monophasé ou triphasé.",
    "Équipez votre garage de {VILLE} d'une wallbox connectée de dernière génération. Pilotez votre consommation depuis votre smartphone et programmez vos charges en fonction des heures creuses Enedis.",
    "Profitez d'une installation soignée de votre borne Wallbox à {VILLE} par des spécialistes de la recharge électrique IRVE intervenant dans tout le département du Rhône."
  ]
};

const USE_CASE_POOLS: Record<string, string[]> = {
  main: [
    "La pose d'une borne de 7.4 kW à domicile permet de recharger n'importe quel véhicule (Tesla Model Y, Peugeot e-208, Megane E-Tech, BMW i4) en récupérant environ 40 à 50 km d'autonomie par heure de charge.",
    "Pour les foyers disposant d'un abonnement électrique triphasé, l'installation d'une borne de 11 kW ou 22 kW permet de diviser par trois le temps de charge de votre batterie sans risquer de surcharger le réseau grâce au Smart Charging.",
    "Une wallbox installée dans votre garage ou sur votre place de parking à {VILLE} sécurise la charge de votre véhicule en évitant toute surchauffe des câbles grâce à des protections électriques dédiées (interrupteur différentiel de type A-EV et disjoncteur adapté).",
    "Nos techniciens IRVE recommandent l'installation de bornes de grandes marques (Schneider EVlink, Legrand Green'Up Premium, Wallbox Pulsar Plus) équipées d'un câble de type 2 pour s'adapter à l'ensemble des véhicules électriques du marché européen.",
    "Que ce soit pour une recharge quotidienne rapide après vos trajets dans la métropole lyonnaise ou pour des recharges ponctuelles le week-end, une borne murale de 7.4 kW assure une flexibilité totale et préserve la durée de vie de votre batterie.",
    "L'installation d'une prise renforcée Green'Up (3.7 kW) peut suffire pour les véhicules hybrides rechargeables, mais pour un véhicule 100% électrique, seule une borne wallbox garantit une recharge complète en une nuit."
  ],
  copropriete: [
    "Pour faire valoir votre droit à la prise, vous devez envoyer un dossier technique détaillé au syndic de copropriété par lettre recommandée. Celui-ci dispose de 3 mois pour inscrire le point à l'ordre du jour de la prochaine AG.",
    "La solution classique consiste à raccorder votre borne de recharge individuelle au tableau général des parties communes (TGBT) de la résidence lyonnaise, avec la pose d'un sous-compteur individuel certifié MID pour la facturation des consommations.",
    "Pour les résidences de {VILLE} comptant de nombreuses demandes, nous recommandons une infrastructure collective avec une colonne horizontale Enedis, permettant à chaque résident d'ouvrir un abonnement Linky indépendant.",
    "L'installation d'une borne en sous-sol à {VILLE} exige de respecter des normes de sécurité incendie strictes et d'utiliser du matériel robuste avec un indice de protection IK10 contre les chocs dans les espaces de manœuvre.",
    "Que vous soyez propriétaire occupant ou locataire à {VILLE}, le syndic ne peut s'opposer aux travaux d'installation d'une borne individuelle que pour un motif sérieux et légitime, comme l'existence d'un projet collectif.",
    "La mise en place d'une solution de recharge partagée ou individuelle en copropriété permet de répartir équitablement les coûts de consommation d'électricité grâce à des relevés de télé-relève automatisés ou des badges RFID."
  ],
  wallbox: [
    "Une Wallbox de 7.4 kW en monophasé est idéale pour la majorité des maisons individuelles à {VILLE}. Elle permet de recharger complètement une batterie de 60 kWh (type Megane E-Tech ou Tesla Model 3) en une seule nuit.",
    "Pour les propriétaires disposant d'une installation en triphasé à {VILLE}, les bornes de 11 kW ou 22 kW offrent une vitesse supérieure, chargeant votre véhicule compatible en seulement 3 à 5 heures pour une autonomie maximale.",
    "Les bornes murales sélectionnées par nos électriciens partenaires intègrent un protocole OCPP et une connectivité Bluetooth ou Wi-Fi pour planifier facilement vos sessions de charge depuis une application mobile dédiée.",
    "La pose d'une Wallbox nécessite des protections électriques obligatoires dans votre tableau de {VILLE} : un disjoncteur adapté et un interrupteur différentiel de type A-EV capable de détecter les fuites de courant continu.",
    "Certaines wallbox intelligentes comme la Wallbox Pulsar Plus ou la Legrand Green'Up intègrent un lecteur de carte RFID pour sécuriser l'accès et empêcher les personnes non autorisées de recharger leur véhicule chez vous.",
    "Une borne de recharge rapide est particulièrement recommandée si vous roulez beaucoup dans le Rhône et avez besoin de récupérer rapidement de l'autonomie entre deux trajets professionnels ou personnels."
  ]
};

const ECO_POOLS: Record<string, string[]> = {
  main: [
    "En programmant la charge de votre véhicule électrique pendant les heures creuses d'Enedis dans le Rhône (souvent entre 22h et 6h), vous réduisez votre facture d'électricité et divisez par 5 vos dépenses de carburant.",
    "Avec un tarif de recharge à domicile à {VILLE} estimé à moins de 2 € pour 100 km, l'amortissement de votre investissement dans une borne IRVE s'effectue en moins de 18 mois par rapport à un véhicule thermique.",
    "Le crédit d'impôt de 500 € disponible en 2026, combiné à la TVA réduite à 5,5% sur le matériel et la main d'œuvre, rend l'installation d'une borne de recharge particulièrement accessible pour les particuliers.",
    "Grâce aux fonctionnalités intelligentes des wallbox modernes, vous pouvez suivre en temps réel vos consommations et optimiser vos charges pour profiter pleinement des tarifs d'électricité les plus avantageux.",
    "Le pilotage de la charge permet également d'intégrer des panneaux solaires si vous en êtes équipé à {VILLE}, vous permettant de rouler avec une énergie 100% verte et gratuite produite directement sur votre toit.",
    "Éviter les recharges régulières sur les bornes publiques rapides (qui appliquent des tarifs élevés) en rechargeant principalement chez soi à {VILLE} permet de réaliser plus de 1 200 € d'économies annuelles."
  ],
  copropriete: [
    "Grâce au programme ADVENIR spécifique pour la copropriété, vous bénéficiez d'une aide financière couvrant 50% du montant des travaux, avec un plafond de 960 € TTC par point de recharge installé à {VILLE}.",
    "En plus de la prime ADVENIR, l'installation d'une borne en copropriété est éligible au crédit d'impôt de 500 € et à un taux de TVA réduit à 5,5%, ce qui réduit considérablement le coût restant à votre charge.",
    "Raccorder votre borne au compteur des parties communes avec un système de sous-comptage vous permet de ne payer que l'électricité que vous consommez réellement, au tarif négocié par la copropriété.",
    "La recharge en heures creuses au sein de votre résidence à {VILLE} reste de loin la solution la plus économique pour alimenter votre véhicule électrique, préservant ainsi votre budget énergie mensuel.",
    "Le financement de l'infrastructure collective de recharge peut être pris en charge par des opérateurs tiers sans frais pour la copropriété, les utilisateurs payant ensuite un abonnement individuel.",
    "Investir dans une borne en copropriété à {VILLE} permet de réaliser des économies substantielles à long terme en évitant les tarifs excessifs pratiqués sur les réseaux de recharge publics extérieurs."
  ],
  wallbox: [
    "Grâce au pilotage énergétique de votre Wallbox à {VILLE}, la charge s'active automatiquement pendant les heures creuses, vous permettant de rouler pour environ 2 € par recharge complète de votre batterie.",
    "Le crédit d'impôt national pour la pose d'une borne de recharge a été fixé à 500 € par contribuable en 2026, cumulable avec la TVA à 5,5% appliquée par votre installateur IRVE qualifié.",
    "L'installation d'une borne de recharge rapide vous évite d'utiliser régulièrement les chargeurs publics rapides de type DC, dont le coût au kWh est 3 à 4 fois plus élevé que l'électricité domestique à {VILLE}.",
    "Les bornes équipées de capteurs de puissance modulable adaptent leur vitesse de recharge en fonction des autres équipements de votre maison de {VILLE}, vous évitant de payer un abonnement Enedis plus cher.",
    "Si vous possédez une installation photovoltaïque à {VILLE}, certaines wallbox de marque SolarEdge ou Easee peuvent canaliser le surplus de production solaire directement dans la batterie de votre voiture.",
    "Investir dans une wallbox performante à domicile à {VILLE} est rapidement rentabilisé en profitant des tarifs d'électricité régulés d'Enedis et en limitant les recharges d'urgence sur autoroute."
  ]
};

const COMMUNE_DATA_POOLS: Record<string, string[]> = {
  main: [
    "Nos électriciens partenaires analysent la capacité de votre tableau de répartition principal. Souvent, dans le bâti ancien ou rénové du Rhône, une mise aux normes mineure ou l'ajout d'un interrupteur différentiel adapté est requis.",
    "À {VILLE}, nous vérifions systématiquement la qualité de la prise de terre avant toute pose de borne. Une résistance de terre supérieure à 100 Ohms empêcherait le véhicule électrique de démarrer sa charge par sécurité.",
    "Le réseau électrique Enedis à {VILLE} délivre une tension stable, mais la pose d'un module de délestage est indispensable pour les abonnements de 6 kVA afin de ne pas couper le courant lors du démarrage d'appareils gourmands.",
    "L'installation électrique de votre maison doit être auditée par un professionnel IRVE. Dans le 69, de nombreux tableaux nécessitent un simple réagencement pour accueillir le disjoncteur et le différentiel dédiés à la wallbox.",
    "Nos installateurs se chargent de vérifier la puissance souscrite auprès de votre fournisseur. Si un passage de 6 à 9 kVA est nécessaire, nous vous guidons dans les démarches auprès d'Enedis Rhône.",
    "Chaque installation de borne à {VILLE} respecte scrupuleusement le cahier des charges de la norme NF C 15-100, garantissant une protection optimale contre les surcharges et les courts-circuits accidentels."
  ],
  copropriete: [
    "L'installation dans les parkings collectifs du Rhône nécessite l'intervention d'un électricien qualifié IRVE pour garantir la conformité avec le guide technique de l'association Promotelec et les décrets en vigueur.",
    "À {VILLE}, nous analysons le tableau général basse tension (TGBT) de votre copropriété pour déterminer la puissance disponible. Parfois, l'installation d'un gestionnaire d'énergie collectif est requise pour éviter de saturer le réseau.",
    "Le câblage dans un parking souterrain à {VILLE} doit emprunter des chemins de câbles coupe-feu spécifiques pour se conformer à la réglementation sur la sécurité incendie dans les bâtiments d'habitation.",
    "Nos installateurs coordonnent leur travail avec le syndic de votre résidence à {VILLE}. Nous fournissons un schéma d'implantation technique clair pour valider la faisabilité du raccordement électrique.",
    "Dans les résidences du 69, l'accès à la borne est sécurisé par un lecteur de badge ou une clé physique. Cela empêche toute utilisation frauduleuse de votre électricité par un autre résident.",
    "Chaque projet en copropriété à {VILLE} respecte les normes d'accessibilité PMR (Personnes à Mobilité Réduite) pour l'emplacement de la borne et la maniabilité du câble de recharge."
  ],
  wallbox: [
    "L'installation d'une wallbox à {VILLE} doit impérativement être validée par un diagnostic de votre réseau électrique intérieur afin de s'assurer de la bonne section de câble et de la présence d'une prise de terre conforme.",
    "À {VILLE}, de nombreuses installations électriques résidentielles nécessitent la pose d'un module de délestage Linky TIC pour éviter la coupure du disjoncteur général lorsque la borne fonctionne en même temps que le chauffage.",
    "Les techniciens IRVE intervenant à {VILLE} vérifient la conformité de votre tableau électrique principal. Si nécessaire, un tableau secondaire dédié à la borne de recharge sera mis en place pour garantir la sécurité.",
    "Le choix de la puissance de votre borne dépend directement de votre abonnement électrique à {VILLE}. Une borne de 7.4 kW requiert un abonnement minimum de 9 kVA (45 Ampères) pour fonctionner confortablement.",
    "Dans les zones rurales ou périurbaines du Rhône, nos installateurs veillent à équiper les wallbox extérieures de protections renforcées contre la foudre et les surtensions électriques du réseau.",
    "Toutes les wallbox installées par nos artisans certifiés à {VILLE} respectent les directives européennes et françaises avec des connecteurs de type 2S équipés d'obturateurs de sécurité enfants."
  ]
};

const EXPERT_TIP_POOLS: Record<string, string[]> = {
  main: [
    "Conseil de pro : Privilégiez une borne équipée d'un capteur de courant qui ajuste dynamiquement la charge. C'est l'assurance d'éviter les disjonctions générales sans avoir à augmenter votre abonnement Enedis.",
    "Astuce technique : Si votre borne est installée en extérieur à {VILLE}, exigez une pose sous abri ou une borne certifiée IP55 avec obturateurs de sécurité (prises T2S) pour résister aux intempéries et gelées.",
    "Recommandation IRVE : Ne sous-estimez pas la section du câble d'alimentation de la borne. Pour une borne de 7.4 kW située à 15 mètres du tableau, un câble en cuivre de 10 mm² est indispensable pour éviter les pertes d'énergie.",
    "Avis de l'électricien : Optez pour une borne évolutive compatible OCPP. Cela vous permettra de la connecter facilement à des applications de recharge intelligente ou à un futur système de gestion énergétique domestique.",
    "Conseil sécurité : L'utilisation d'une prise classique pour recharger un VE présente un risque d'échauffement important. La wallbox intègre des circuits de détection de fuite de courant continu pour une protection totale.",
    "Le conseil lyonnais : En hiver dans le 69, programmez la fin de charge juste avant votre départ. La batterie sera encore tiède, ce qui améliorera l'autonomie et le freinage régénératif dès les premiers kilomètres de votre trajet."
  ],
  copropriete: [
    "Conseil d'expert : N'attendez pas la tenue de l'AG pour envoyer votre dossier en recommandé. Plus vite le syndic reçoit votre demande technique rédigée par nos soins, plus vite la convention de travaux sera signée.",
    "Astuce copro : Proposez au syndic une solution de recharge collective évolutive. Même si vous êtes le premier demandeur à {VILLE}, d'autres voisins suivront et une infrastructure commune évitera de multiplier les câbles individuels.",
    "Recommandation technique : Pour les parkings extérieurs à {VILLE}, optez pour une borne sur pied robuste dotée d'un indice IK10 et d'une trappe verrouillable pour protéger la prise contre le vandalisme.",
    "Le conseil juridique : Rappelez à votre syndic que le droit à la prise est garanti par la loi. Si aucune décision n'est prise dans les 3 mois suivant la réception de votre demande, vous pouvez lancer les travaux individuellement.",
    "Avis de l'électricien : Dans le cas d'une recharge raccordée aux parties communes, assurez-vous que le sous-compteur installé est certifié MID (Mesure Instruments Directive) pour que la facturation soit juridiquement incontestable.",
    "Conseil pratique : Choisissez une borne équipée d'une connectivité Wi-Fi ou 4G pour permettre le suivi de consommation et la mise à jour à distance du micrologiciel de votre équipement de recharge."
  ],
  wallbox: [
    "Le conseil de l'artisan : Pour une borne installée à {VILLE}, choisissez un modèle doté d'une application de contrôle robuste. Cela vous permettra de suivre précisément votre historique de consommation pour votre comptabilité.",
    "Astuce technique : Si vous prévoyez d'acheter un second véhicule électrique à l'avenir, optez dès maintenant pour une borne capable de gérer la charge partagée intelligente entre deux points de charge.",
    "Recommandation IRVE : Évitez les câbles de recharge trop courts. Un câble de 5 ou 7 mètres offre un confort d'utilisation optimal, quelle que soit la position de la trappe de recharge de votre véhicule dans votre allée à {VILLE}.",
    "Conseil d'expert : Pensez à vérifier la garantie constructeur de votre wallbox. Les fabricants leaders (Hager, Schneider, Easee) proposent des extensions de garantie jusqu'à 5 ans qui sécurisent votre investissement.",
    "Avis de l'électricien : Si votre maison à {VILLE} dispose d'une installation en triphasé, préférez une borne de 22 kW bridable à 11 kW. Cela vous donne une flexibilité totale selon les capacités de charge de vos futurs véhicules.",
    "Le conseil technique : Protégez toujours votre investissement. Enroulez soigneusement le câble de charge sur un support mural dédié à {VILLE} après chaque utilisation pour éviter de l'endommager avec le temps."
  ]
};

const REAL_ESTATE_POOLS: Record<string, string[]> = {
  main: [
    "Les agences immobilières du Rhône confirment qu'une maison équipée d'une borne de recharge rapide se vend plus rapidement et gagne une valeur verte immédiate estimée entre 2% et 4% sur le marché immobilier de {VILLE}.",
    "À {VILLE}, la présence d'une wallbox opérationnelle dans le garage est un argument de poids lors des visites d'acquéreurs potentiels, de plus en plus nombreux à posséder ou projeter l'achat d'un véhicule électrique.",
    "Valoriser son patrimoine immobilier passe aujourd'hui par la transition énergétique. Installer une borne IRVE de qualité valorise votre bien tout en le démarquant des autres annonces du secteur de {VILLE}.",
    "Avec l'interdiction progressive des véhicules thermiques, une place de stationnement déjà câblée pour la recharge de véhicules électriques est un équipement standard recherché par les acheteurs à {VILLE}.",
    "Selon les notaires du Rhône, les biens équipés d'une borne de recharge rapide dans le secteur de {VILLE} se négocient avec une décote moindre en période de marché baissier, la valeur verte agissant comme un amortisseur de prix.",
    "Les diagnostiqueurs immobiliers à {VILLE} intègrent désormais la présence d'une borne IRVE dans l'audit énergétique du logement. C'est un critère de différenciation qui séduit une clientèle d'acheteurs CSP+ sensibilisés à la mobilité décarbonée.",
    "À {VILLE}, les programmes de lotissements neufs livrés depuis 2024 intègrent systématiquement un pré-câblage borne de recharge dans le garage. Ne pas équiper une maison existante, c'est prendre du retard sur le standard du marché local.",
    "Le marché de la location meublée à {VILLE} récompense les propriétaires-bailleurs qui proposent un point de charge privé : les loyers peuvent être majorés de 30 à 50 € par mois grâce à ce service supplémentaire, très demandé."
  ],
  copropriete: [
    "Un appartement avec place de parking câblée ou équipée d'une borne à {VILLE} voit sa valeur immobilière augmenter de façon significative. C'est un argument de vente majeur pour les acheteurs urbains du Rhône.",
    "Dans les copropriétés de {VILLE}, disposer d'un équipement IRVE individuel permet de louer ou vendre sa place de parking beaucoup plus facilement et avec une plus-value estimée à plus de 2 000 €.",
    "La valeur verte des logements collectifs à {VILLE} devient un critère de choix pour les locataires et acquéreurs équipés de VE, qui écartent désormais les résidences dépourvues de solution de recharge.",
    "Équiper sa copropriété d'une infrastructure de recharge collective est un investissement qui modernise l'immeuble et préserve l'attractivité immobilière de la copropriété à {VILLE} face aux constructions neuves.",
    "Les résidences collectives de {VILLE} qui anticipent l'équipement IRVE attirent un vivier de locataires actifs roulant en VE. La demande pour des appartements avec parking équipé explose dans tout le Rhône.",
    "D'après les agences immobilières de {VILLE}, un lot de copropriété sans solution de recharge met en moyenne 25% de temps de plus à se vendre qu'un lot équipé ou dans un immeuble pré-câblé.",
    "Les syndics professionnels du Rhône recommandent aux copropriétés de {VILLE} de voter un plan de pré-câblage global pour éviter une dépréciation collective du patrimoine immobilier face aux immeubles neufs conformes RT 2020.",
    "L'installation d'une borne en parking souterrain à {VILLE} est perçue par les banques comme un investissement valorisant : certaines offres de prêt immobilier vert intègrent le financement de la borne dans le prêt principal."
  ],
  wallbox: [
    "L'installation d'une wallbox de marque reconnue valorise immédiatement votre maison à {VILLE} en augmentant sa valeur verte de 3% à 5% auprès des acquéreurs de plus en plus attentifs aux équipements de recharge à domicile.",
    "Avoir une borne de recharge rapide pré-équipée dans son garage est un critère de confort haut de gamme très recherché lors des transactions immobilières dans le secteur de {VILLE}.",
    "Un logement prêt pour la mobilité électrique à {VILLE} se vend en moyenne 15 jours plus vite sur le marché du Rhône, les acheteurs appréciant de ne pas avoir à réaliser ces travaux complexes eux-mêmes.",
    "Dans le Rhône, les maisons disposant d'un carport ou d'un garage équipé d'une wallbox 7.4 kW se positionnent en tête des recherches immobilières des jeunes couples actifs roulant en électrique.",
    "Les diagnostiqueurs DPE du secteur de {VILLE} signalent que les acquéreurs demandent de plus en plus souvent si la maison est pré-équipée pour la recharge d'un véhicule électrique avant même de visiter le bien.",
    "Une maison avec wallbox 11 kW et abonnement triphasé à {VILLE} représente un argument décisif face à la concurrence des constructions neuves RT 2020, qui intègrent systématiquement le pré-câblage IRVE.",
    "Le retour sur investissement d'une wallbox à {VILLE} ne se mesure pas uniquement en économies de carburant : la plus-value immobilière générée peut atteindre 8 000 à 12 000 € lors de la revente du bien.",
    "Les mandataires immobiliers spécialisés en biens de standing à {VILLE} incluent désormais la wallbox dans les critères de recherche premium au même titre que la piscine ou la domotique."
  ]
};

const POPULATION_TIER_POOLS: Record<string, string[]> = {
  main: [
    "Avec une population locale active et un tissu urbain en pleine mutation, {VILLE} encourage le développement des mobilités douces et de l'électromobilité. Installer sa borne privée est le moyen idéal de devancer les futures réglementations.",
    "Dans cette commune dynamique du 69, le nombre d'utilisateurs de véhicules propres augmente rapidement. Pouvoir recharger chez soi reste le moyen le plus confortable et le plus économique pour vos trajets quotidiens.",
    "Les infrastructures publiques de recharge se développent à {VILLE}, mais elles ne remplaceront jamais la sérénité et le tarif avantageux d'une recharge nocturne effectuée directement dans votre allée ou garage.",
    "En tant que commune accueillante du département du Rhône, {VILLE} voit sa part de voitures électriques grandir. Nos électriciens locaux contribuent activement à cette transition en équipant les foyers de bornes fiables.",
    "Les trajets domicile-travail depuis {VILLE} vers Lyon ou les pôles d'activités du Rhône sont idéalement couverts par une recharge nocturne à domicile. Un plein électrique chaque matin sans passer par une station-service, c'est le nouveau standard.",
    "La qualité de vie à {VILLE} passe aussi par la maîtrise de ses coûts de déplacement. Une borne de recharge IRVE à domicile permet de diviser par 5 le budget carburant mensuel des foyers qui parcourent 30 à 60 km par jour.",
    "Le réseau de transports en commun du Rhône complète l'offre de mobilité à {VILLE}, mais pour les trajets péri-urbains et les courses du quotidien, la voiture électrique rechargée à domicile reste imbattable en souplesse et en coût.",
    "L'évolution rapide du parc automobile à {VILLE} montre que les véhicules 100% électriques dépassent désormais les hybrides dans les nouvelles immatriculations. Cette tendance confirme le besoin d'équiper les domiciles en bornes de recharge rapide."
  ],
  copropriete: [
    "Dans les zones denses de {VILLE}, où le logement collectif représente une part importante du parc immobilier, l'adaptation des copropriétés à la recharge électrique est un enjeu écologique et économique majeur.",
    "Le nombre croissant de résidents roulant en électrique à {VILLE} pousse les syndics de copropriété à moderniser les installations de stationnement pour offrir des solutions de charge partagées ou individuelles.",
    "À {VILLE}, de nombreuses résidences collectives se tournent vers nos électriciens IRVE pour déployer des infrastructures prêtes à l'emploi, anticipant ainsi la généralisation des véhicules électriques.",
    "Installer une borne dans son immeuble à {VILLE} permet de s'affranchir de la recherche quotidienne d'une borne publique disponible dans le quartier, tout en profitant du confort d'une recharge à domicile.",
    "La densité de population à {VILLE} rend les bornes publiques souvent saturées aux heures de pointe. Les copropriétaires avisés préfèrent investir dans un point de charge privatif dans leur parking pour s'assurer une disponibilité garantie.",
    "Les bailleurs sociaux du Rhône commencent à équiper leurs résidences à {VILLE} en bornes de recharge partagées. Cette tendance témoigne d'un besoin massif, y compris dans les logements collectifs à loyer modéré.",
    "Le programme local de rénovation urbaine à {VILLE} intègre désormais systématiquement le pré-câblage des parkings pour la recharge électrique, preuve que la mobilité décarbonée est au cœur de la planification urbaine du Rhône.",
    "Les conseils syndicaux de {VILLE} sont de plus en plus sollicités par les copropriétaires souhaitant installer une borne. L'anticipation collective évite des travaux individuels coûteux et garantit une infrastructure cohérente et pérenne."
  ],
  wallbox: [
    "À {VILLE}, la transition vers la voiture électrique est en marche. Disposer d'une wallbox rapide à domicile est la solution la plus pratique pour recharger chaque soir et démarrer la journée avec une batterie pleine.",
    "Le développement urbain de {VILLE} s'accompagne d'une demande croissante pour des solutions de charge résidentielles rapides, portées par des électriciens locaux certifiés IRVE.",
    "Même si la ville de {VILLE} déploie de nouvelles bornes publiques, la wallbox privée reste l'équipement indispensable pour recharger au meilleur tarif sans contrainte de temps ni d'attente.",
    "En choisissant d'installer une borne rapide chez vous à {VILLE}, vous rejoignez les nombreux foyers du 69 qui ont fait le choix d'une mobilité simplifiée et économique au quotidien.",
    "Les résidents de {VILLE} qui optent pour une wallbox témoignent d'un gain de confort majeur : finies les files d'attente sur les superchargeurs en zone commerciale pour quelques dizaines de kilomètres d'autonomie.",
    "L'engouement pour les véhicules électriques à {VILLE} dépasse la simple tendance écologique. C'est un choix économique rationnel quand on dispose d'une wallbox 7.4 kW alimentée en heures creuses Enedis à 0,16 €/kWh.",
    "Les familles de {VILLE} avec deux véhicules constatent qu'une seule wallbox 7.4 kW suffit pour couvrir les besoins de recharge de deux voitures, à condition de programmer les charges en alternance via l'application mobile.",
    "La généralisation du télétravail à {VILLE} renforce l'intérêt de la wallbox domestique : le véhicule est garé plus longtemps à domicile, ce qui permet une recharge complète même en heures creuses de 6 heures."
  ]
};

// FAQ Pools
const FAQ_POOLS: Record<string, { question: string; answer: string }[]> = {
  main: [
    {
      question: "Faut-il modifier mon compteur Enedis pour une installation de borne à {VILLE} ?",
      answer: "Si vous optez pour une borne de 7.4 kW en monophasé, un abonnement de 9 kVA (45 A) est généralement recommandé. Pour une borne de 11 kW ou 22 kW en triphasé, il est nécessaire de demander à Enedis Rhône de modifier votre raccordement pour passer en triphasé."
    },
    {
      question: "Quel est le tarif moyen d'un électricien IRVE pour poser une borne à {VILLE} ?",
      answer: "Le coût moyen oscille entre 1 300 € et 1 900 € TTC avant déduction des aides financières. Ce tarif comprend la fourniture de la wallbox, le disjoncteur différentiel adapté, le câblage et la mise en service réglementaire."
    },
    {
      question: "Existe-t-il des subventions locales ou métropolitaines dans le Rhône ?",
      answer: "En plus du crédit d'impôt national de 500 € et de la TVA réduite à 5,5%, la Métropole de Lyon propose des aides complémentaires pour la transition énergétique en copropriété ou pour les résidents de la ZFE Grand Lyon."
    },
    {
      question: "Combien de temps durent les travaux de pose d'une borne à {VILLE} ?",
      answer: "Dans la grande majorité des cas, l'installation d'une borne de recharge dans une maison individuelle à {VILLE} prend entre une demi-journée et une journée complète, selon la distance entre le tableau électrique et l'emplacement de la borne."
    },
    {
      question: "Quelle est la différence entre une prise Green'Up et une borne Wallbox ?",
      answer: "La prise Green'Up charge à 3.7 kW (environ 15-20 km d'autonomie par heure), tandis qu'une wallbox classique charge à 7.4 kW ou plus (jusqu'à 50 km par heure). La wallbox est donc deux fois plus rapide et intègre des fonctions de pilotage intelligent."
    },
    {
      question: "Puis-je installer ma borne moi-même pour économiser sur la main d'œuvre ?",
      answer: "Non, la loi française impose que toute borne d'une puissance supérieure à 3.7 kW soit installée par un professionnel certifié IRVE. De plus, réaliser la pose vous-même annulerait les garanties du constructeur et votre assurance habitation en cas d'incendie."
    },
    {
      question: "Comment fonctionne le délestage dynamique recommandé dans le Rhône ?",
      answer: "Le délestage dynamique mesure en temps réel la consommation électrique globale de votre logement. Si vous allumez des appareils énergivores, la borne réduit automatiquement sa puissance de charge pour éviter de faire disjoncter le compteur Linky."
    },
    {
      question: "Les bornes de recharge installées dans le 69 sont-elles compatibles avec toutes les voitures ?",
      answer: "Oui, les bornes résidentielles installées en France utilisent un connecteur de Type 2, qui est le standard européen obligatoire. Elles sont donc compatibles avec 100% des véhicules électriques et hybrides rechargeables récents."
    },
    {
      question: "Quelles sont les meilleures marques de bornes recommandées à {VILLE} ?",
      answer: "Nos techniciens installent principalement les marques Hager (Witty), Schneider Electric (EVlink), Legrand, Wallbox (Pulsar Plus) et Easee. Ces modèles sont reconnus pour leur fiabilité, leur robustesse et leurs options de connectivité."
    },
    {
      question: "Une borne extérieure résiste-t-elle au climat humide ou froid du Rhône ?",
      answer: "Oui, les bornes posées en extérieur possèdent un indice d'étanchéité minimal IP54 et de résistance aux chocs IK08. Elles sont conçues pour résister à la pluie, à la neige et aux températures négatives hivernales courantes à {VILLE}."
    },
    {
      question: "Qu'est-ce que la recharge bidirectionnelle V2H (Vehicle-to-Home) ?",
      answer: "Le V2H permet d'utiliser la batterie de votre voiture électrique comme source d'énergie de secours pour votre maison à {VILLE}. Certaines wallbox compatibles (comme la Wallbox Quasar) permettent de réinjecter l'électricité stockée dans votre batterie vers votre réseau domestique en cas de coupure Enedis."
    },
    {
      question: "L'installation d'une borne augmente-t-elle la valeur de revente de ma maison à {VILLE} ?",
      answer: "Oui, les notaires du Rhône observent une plus-value de 2% à 5% sur les biens équipés d'une borne de recharge. C'est un critère de confort recherché par les acquéreurs en 2026, au même titre que la fibre optique ou les panneaux solaires."
    },
    {
      question: "Mon compteur Linky est-il compatible avec une borne de recharge à {VILLE} ?",
      answer: "Oui, le compteur Linky est parfaitement compatible et même recommandé. Il permet le délestage dynamique (TIC Linky) qui ajuste la puissance de la borne en temps réel selon votre consommation globale, évitant ainsi les disjonctions."
    },
    {
      question: "Quelle est la garantie offerte sur l'installation de la borne de recharge ?",
      answer: "Nos installateurs IRVE à {VILLE} fournissent une garantie décennale sur la partie électrique fixe (câblage, protections) et une garantie constructeur de 2 à 5 ans sur la borne elle-même. L'entretien annuel préventif est recommandé pour les bornes installées en extérieur."
    },
    {
      question: "Est-il nécessaire de passer en triphasé pour installer une wallbox à {VILLE} ?",
      answer: "Non, une borne de 7.4 kW fonctionne parfaitement en monophasé (le standard des foyers français). Le triphasé n'est nécessaire que pour les puissances de 11 kW et 22 kW. Le passage en triphasé coûte entre 490 € et 1 250 € et nécessite une demande auprès d'Enedis."
    },
    {
      question: "Comment savoir si mon installation électrique est compatible avec une borne à {VILLE} ?",
      answer: "Nos installateurs IRVE réalisent un diagnostic gratuit de votre installation électrique. Ils vérifient la section du câble d'alimentation, la qualité de la prise de terre (résistance ≤ 100 Ohms), la capacité du tableau de répartition et l'abonnement Enedis en cours."
    }
  ],
  copropriete: [
    {
      question: "Qu'est-ce que le 'droit à la prise' en copropriété à {VILLE} ?",
      answer: "C'est un droit légal qui permet à tout propriétaire ou locataire d'équiper sa place de parking (boxée ou ouverte) d'une borne de recharge à ses propres frais. Le syndic ne peut s'y opposer que pour des motifs graves et légitimes définis par la loi."
    },
    {
      question: "Quel est le montant de la prime ADVENIR pour une copropriété à {VILLE} ?",
      answer: "Pour une installation individuelle en copropriété, le programme ADVENIR finance 50% du montant des travaux (matériel et pose) dans la limite d'un plafond de 960 € TTC par point de charge."
    },
    {
      question: "Quelles sont les étapes pour demander l'installation au syndic ?",
      answer: "Vous devez envoyer un dossier technique complet (comprenant les devis et plans de raccordement d'un électricien IRVE) au syndic par lettre recommandée. Le syndic doit ensuite inscrire ce projet à l'ordre du jour de la prochaine assemblée générale."
    },
    {
      question: "Le syndic peut-il refuser ma demande de droit à la prise ?",
      answer: "Le syndic dispose de 3 mois pour s'opposer aux travaux en saisissant le tribunal judiciaire. Les seuls motifs de refus valables sont la décision de réaliser une infrastructure de recharge collective ou l'impossibilité technique avérée."
    },
    {
      question: "Qui paie l'électricité consommée par ma borne en copropriété ?",
      answer: "Si la borne est raccordée aux parties communes, un sous-compteur certifié MID est installé. L'installateur ou un opérateur de recharge effectue un relevé périodique des consommations pour que vous remboursiez le syndic."
    },
    {
      question: "Est-il possible d'installer un Linky individuel sur ma place de parking à {VILLE} ?",
      answer: "Oui, c'est la solution d'abonnement individuel Enedis. Un nouveau point de livraison est créé par Enedis, avec son propre compteur Linky. Vous choisissez ainsi librement votre fournisseur d'électricité."
    },
    {
      question: "Combien de temps faut-il compter pour voir le projet aboutir en copropriété ?",
      answer: "Il faut généralement compter entre 3 et 6 mois. Ce délai comprend la préparation du dossier technique, le délai de préavis de l'AG de copropriété, la signature de la convention entre le syndic et l'installateur, et la réalisation des travaux."
    },
    {
      question: "Qu'est-ce qu'une infrastructure collective de recharge ?",
      answer: "C'est un réseau électrique déployé dans tout le parking de la copropriété (par Enedis ou un opérateur tiers) qui permet à chaque résident de se raccorder facilement lorsqu'il le souhaite, évitant la multiplication de câbles individuels désordonnés."
    },
    {
      question: "Peut-on poser une prise renforcée plutôt qu'une wallbox en copropriété ?",
      answer: "Oui, la pose d'une prise de type Green'Up est autorisée en copropriété sous réserve de validation technique par l'électricien IRVE. Cependant, elle est également soumise aux règles du droit à la prise."
    },
    {
      question: "Quelles sont les règles de sécurité incendie pour les parkings souterrains à {VILLE} ?",
      answer: "Les parkings couverts doivent respecter les normes de sécurité contre l'incendie (notamment les arrêtés ministériels régissant les bâtiments d'habitation). L'installation doit comprendre des dispositifs de coupure d'urgence accessibles aux pompiers."
    }
  ],
  wallbox: [
    {
      question: "Pourquoi installer une Wallbox plutôt qu'une prise classique à {VILLE} ?",
      answer: "Une wallbox offre une puissance de charge de 7.4 kW à 22 kW, soit une vitesse 3 à 8 fois plus rapide qu'une prise standard. Elle intègre également des protections électriques avancées qui évitent tout risque d'échauffement des câbles de la maison."
    },
    {
      question: "Quelle puissance de Wallbox choisir : 7.4 kW, 11 kW ou 22 kW ?",
      answer: "La borne de 7.4 kW (monophasée) convient à 90% des particuliers car elle permet de recharger le véhicule en une nuit. Les puissances de 11 kW et 22 kW nécessitent une installation électrique en triphasé et un chargeur embarqué compatible dans la voiture."
    },
    {
      question: "Qu'est-ce qu'une borne connectée ou intelligente ?",
      answer: "C'est une borne équipée d'une connexion Wi-Fi, Bluetooth ou 4G. Elle permet de suivre ses consommations depuis une application mobile, de programmer les heures de charge à distance, et de gérer l'accès à la borne via des badges RFID."
    },
    {
      question: "La Wallbox est-elle compatible avec les panneaux solaires à {VILLE} ?",
      answer: "Oui, de nombreux modèles récents possèdent un mode de charge solaire. Ils dirigent le surplus d'électricité produit par vos panneaux photovoltaïques directement dans la batterie de la voiture."
    },
    {
      question: "Peut-on poser une Wallbox en extérieur dans le Rhône ?",
      answer: "Absolument. Les wallbox de qualité résidentielle sont certifiées IP54 ou IP55, ce qui garantit une protection totale contre l'eau de pluie, la poussière et les projections. Elles résistent parfaitement aux hivers de {VILLE}."
    },
    {
      question: "Quel est le crédit d'impôt pour l'achat d'une Wallbox en 2026 ?",
      answer: "Le crédit d'impôt est de 500 € par système de charge installé (limité à un équipement pour une personne seule, et deux pour un couple soumis à une imposition commune), à condition que les travaux soient réalisés par un installateur certifié IRVE."
    },
    {
      question: "Qu'est-ce que le protocole OCPP pour une borne de recharge ?",
      answer: "L'OCPP (Open Charge Point Protocol) est un standard de communication ouvert. Il permet à la borne de communiquer avec n'importe quel logiciel de gestion tiers, ce qui est crucial pour le suivi des charges en entreprise ou en copropriété."
    },
    {
      question: "Quelle la durée de vie moyenne d'une Wallbox à domicile ?",
      answer: "Une borne de recharge bien installée et protégée par un disjoncteur adapté a une durée de vie moyenne de 10 à 15 ans. Choisir des marques européennes reconnues garantit également la disponibilité des pièces de rechange."
    },
    {
      question: "Comment s'effectue le verrouillage de la Wallbox pour éviter les vols d'électricité ?",
      answer: "Les wallbox peuvent être verrouillées de trois manières : via l'application mobile (activation manuelle ou automatique à l'approche de votre smartphone), par badge RFID (fourni avec la borne), ou à l'aide d'une clé physique sur certains modèles."
    },
    {
      question: "Le câble de recharge est-il fourni avec la Wallbox ?",
      answer: "Certaines bornes sont livrées avec un câble attaché (généralement de 5 ou 7 mètres), tandis que d'autres disposent d'une prise T2S femelle, vous obligeant à utiliser le câble fourni avec votre véhicule électrique."
    }
  ]
};

// Rotated item selection helper
function selectRotatedItems<T>(items: T[], slug: string, offset: number, count: number): T[] {
  const selected: T[] = [];
  const indices = new Set<number>();
  let seed = offset;
  while (selected.length < count && selected.length < items.length) {
    const idx = getVariantIndex(slug, seed, items.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      selected.push(items[idx]);
    }
    seed++;
  }
  return selected;
}

export function generateCommuneContent(
  commune: Commune,
  category: 'main' | 'copropriete' | 'wallbox'
): LocalContent {
  const resolvedCategory = category;
  const climateZone = getClimateZone(commune.codePostal, commune.slug);
  const agency = getLocalAgency(commune.codePostal, commune.slug);
  const catOffset = CATEGORY_OFFSETS[category] || 0;
  
  const nearby = getNearbyCommunes(commune.slug, communes as Commune[], 3);

  const zoneLabels = {
    'grand-lyon': "Métropole de Lyon (ZFE Grand Lyon)",
    'beaujolais-saone': "Beaujolais & Val de Saône",
    'ouest-lyonnais-monts': "Monts du Lyonnais & Ouest Lyonnais"
  };

  const patrimoineAnecdotes = {
    'grand-lyon': [
      `Le saviez-vous ? Dans le secteur de ${commune.nom}, à deux pas des traboules du Vieux-Lyon ou des pentes de la Croix-Rousse, le passage en ZFE impose d'installer une borne de recharge extérieure certifiée IP54 et résistante. Pas de place pour l'improvisation si vous voulez recharger votre voiture après vos déplacements lyonnais.`,
      `Entre la majestueuse basilique de Fourvière et les quais rénovés de la Confluence, ${commune.nom} cultive un esprit d'innovation. C'est dans ce cadre dynamique que la transition vers la mobilité électrique s'accélère, portée par des électriciens IRVE attachés à la qualité et au sérieux professionnel typique de Lyon Tech.`,
      `La métropole de Lyon investit massivement dans la mobilité électrique dans le périmètre de ${commune.nom}. Le plan climat-air-énergie territorial (PCAET) fixe un objectif de 100 000 points de charge privés et publics d'ici 2030 dans le Grand Lyon, rendant l'installation de bornes individuelles incontournable.`,
      `${commune.nom} bénéficie d'un réseau de transport multimodal performant (TCL, tramway, métro), mais pour les déplacements en dehors des lignes directes, la voiture électrique rechargée à domicile reste le choix pragmatique des actifs lyonnais soucieux de leur empreinte carbone.`,
      `Le quartier de la Part-Dieu, les zones d'activités de Gerland et le pôle chimie de Feyzin : les pôles d'emploi du Grand Lyon drainent chaque jour des dizaines de milliers de trajets depuis ${commune.nom}. Une borne à domicile transforme ce trajet en déplacement quasi-gratuit grâce à la recharge en heures creuses.`,
      `Avec le prolongement du métro B et le développement du tramway T6, ${commune.nom} s'affirme comme un secteur résidentiel prisé du Grand Lyon. L'ajout d'une wallbox à votre domicile complète parfaitement cette connectivité en offrant une autonomie totale pour vos déplacements électriques.`
    ],
    'beaujolais-saone': [
      `À ${commune.nom}, au cœur du vignoble beaujolais ou sur les rives de la Saône, les demeures traditionnelles en pierres dorées abritent aujourd'hui des technologies de pointe. Rénover son garage ou son allée pour y installer une wallbox blanche discrète, connectée aux heures creuses d'Enedis, c'est allier le charme de l'ancien au confort de 2026.`,
      `Avoir sa wallbox à ${commune.nom}, c'est s'assurer d'une recharge rapide à domicile plutôt que de chercher une borne publique occupée un jour de Fête des Lumières ou de grand déplacement. Nos installateurs locaux connaissent le bâti du Beaujolais sur le bout des doigts pour faire passer les câbles proprement.`,
      `Le Val de Saône et le pays des pierres dorées autour de ${commune.nom} offrent un cadre résidentiel exceptionnel. Les propriétaires de ces maisons de caractère investissent de plus en plus dans l'électromobilité, portés par l'allongement de l'autonomie des véhicules électriques et la baisse des prix des batteries.`,
      `Les vignerons et artisans du Beaujolais à proximité de ${commune.nom} adoptent aussi les utilitaires électriques. Installer une borne de recharge professionnelle dans une exploitation viticole ou un atelier du secteur permet de bénéficier d'amortissements fiscaux accélérés en plus des aides ADVENIR.`,
      `Depuis ${commune.nom}, les trajets quotidiens vers Villefranche-sur-Saône ou Lyon-Vaise par la A6 sont parfaitement couverts par une recharge nocturne de 7 heures. L'autonomie récupérée chaque nuit (200 à 350 km) dépasse largement les besoins des navetteurs beaujolais.`,
      `Le réseau IRVE public reste peu dense dans le secteur viticole de ${commune.nom}. Disposer de sa propre borne de recharge à domicile n'est pas un luxe mais une nécessité pour les résidents qui ne souhaitent pas dépendre des quelques stations publiques de Villefranche-sur-Saône.`
    ],
    'ouest-lyonnais-monts': [
      `Sous le regard des Monts du Lyonnais reconvertis en espaces de loisir, ${commune.nom} s'engage pleinement dans le transport propre. Installer sa borne de recharge individuelle dans une maison de lotissement ou une bâtisse rénovée redonne une vraie valeur immobilière au logement, tout en réduisant vos factures d'énergie.`,
      `À ${commune.nom}, les hivers peuvent être rigoureux sur les hauteurs de l'Ouest. Le gel rappelle que les batteries de voitures électriques ont besoin d'une charge optimale et d'une wallbox abritée dans un garage ou installée sur un pied de borne hermétique avec smart charging.`,
      `Le relief vallonné de l'Ouest Lyonnais autour de ${commune.nom} offre des paysages magnifiques mais aussi des routes sinueuses où le freinage régénératif des voitures électriques permet de récupérer de l'énergie à chaque descente. La wallbox à domicile complète ce cycle vertueux en rechargeant chaque nuit.`,
      `Les communes de l'Ouest Lyonnais comme ${commune.nom} connaissent une forte croissance démographique portée par les familles en quête de nature. Le taux de maisons individuelles élevé dans ce secteur rend l'installation d'une borne de recharge particulièrement simple et rapide.`,
      `Le réseau Enedis dans le secteur de ${commune.nom} est parfaitement dimensionné pour accueillir des bornes de recharge résidentielles. Les transformateurs HTA/BT desservant les lotissements récents disposent d'une marge de puissance suffisante, évitant dans la plupart des cas un renforcement coûteux.`,
      `Les marchés locaux et commerces de proximité de ${commune.nom} sont souvent accessibles en voiture électrique depuis les hameaux environnants. Disposer d'une wallbox à domicile permet ces petits trajets quotidiens sans jamais s'inquiéter de l'autonomie restante.`
    ]
  };

  const localIntroPools = [
    `Pour les propriétaires de ${commune.nom} (${commune.codePostal}), disposer d'un point de recharge rapide à domicile est devenu indispensable. Avec une population de ${commune.population?.toLocaleString('fr-FR')} habitants et un parc immobilier composé à ${commune.logementsMaison}% de maisons individuelles, la configuration locale est idéale pour la pose d'une wallbox 7.4 kW ou 22 kW dans un garage ou une allée privée.`,
    `Faire installer une borne de recharge de voiture électrique à ${commune.nom} par un électricien agréé IRVE permet de bénéficier de garanties uniques. Dans le Rhône, où la ZFE de Lyon pousse à l'électrification rapide, la recharge rapide protège la longévité de votre véhicule électrique.`,
    `${commune.nom} est une ${commune.profilCommune || 'commune'} du Rhône où le marché immobilier est qualifié de ${commune.marcheImmobilier || 'intermédiaire'}. Les ${commune.logements?.toLocaleString('fr-FR') || 'nombreux'} logements du parc local, dont ${commune.logementsMaison}% de maisons individuelles, offrent un potentiel considérable pour l'installation de bornes de recharge privées.`,
    `Avec ${commune.vehiculesElectriques?.toLocaleString('fr-FR') || 'un nombre croissant de'} véhicules électriques estimés en circulation à ${commune.nom} et une croissance annuelle de ${commune.croissanceVE || 25}%, la demande d'installation de bornes de recharge résidentielles ne cesse d'augmenter dans cette commune du département 69.`,
    `Située à ${commune.distanceLyon || 'proximité de'} km du centre de Lyon, ${commune.nom} offre un cadre de vie ${commune.tauxMaisonLabel || 'résidentiel'} avec un prix immobilier moyen de ${commune.prixM2Moyen?.toLocaleString('fr-FR') || '3 500'} €/m². Équiper sa résidence d'une borne de recharge IRVE est un investissement qui renforce la valeur de votre bien.`,
    `La commune de ${commune.nom}, rattachée à ${commune.intercommunalite || 'une intercommunalité du Rhône'}, compte environ ${commune.bornesPubliques || 'quelques'} bornes publiques de recharge pour une densité de ${commune.densiteBornes || 'quelques'} points de charge pour 1 000 habitants. L'installation d'une borne privée est essentielle pour compléter cette offre encore insuffisante.`,
    `Dans un secteur immobilier ${commune.marcheImmobilier || 'dynamique'} comme ${commune.nom}, où le prix moyen au m² atteint ${commune.prixM2Moyen?.toLocaleString('fr-FR') || '3 500'} €, investir dans une borne de recharge certifiée IRVE est un choix de valorisation patrimoniale autant qu'un geste pour la transition énergétique du Rhône.`,
    `${commune.nom} compte parmi les communes du Rhône qui affichent une croissance de ${commune.croissanceVE || 25}% des immatriculations de véhicules électriques. Nos installateurs certifiés IRVE accompagnent les ${commune.population?.toLocaleString('fr-FR') || 'nombreux'} habitants de cette ${commune.profilCommune || 'commune'} dans l'équipement de leur domicile en solution de recharge rapide.`
  ];

  const agencyClosingPools = [
    `L'Espace Conseil ${agency.name} (que vous pouvez joindre au sujet des aides locales) recommande l'installation de bornes équipées du protocole de communication OCPP pour piloter précisément la charge en fonction de la production solaire ou du tarif d'électricité Enedis local.`,
    `Pour tout renseignement sur les subventions disponibles, ${agency.name} est l'interlocuteur de référence dans le Rhône. Nos techniciens IRVE travaillent en coordination avec cet organisme pour maximiser les aides financières dont vous bénéficiez à ${commune.nom}.`,
    `${agency.name} (${agency.detail}) accompagne gratuitement les particuliers de ${commune.nom} dans leurs projets de transition énergétique. N'hésitez pas à les contacter pour un bilan personnalisé avant de lancer votre installation de borne.`,
    `L'expertise locale de ${agency.name} combinée au savoir-faire de nos électriciens IRVE garantit aux résidents de ${commune.nom} une installation conforme aux dernières normes et éligible à l'ensemble des aides financières disponibles en 2026.`
  ];

  const localContextText = [
    localIntroPools[getVariantIndex(commune.slug, 1, localIntroPools.length)],
    patrimoineAnecdotes[climateZone][getVariantIndex(commune.slug, 2, patrimoineAnecdotes[climateZone].length)],
    agencyClosingPools[getVariantIndex(commune.slug, 3, agencyClosingPools.length)]
  ].join(' ');

  const pricing = getDynamicPrices(commune);

  // Dynamic savings calculation
  let baseSavings = 1400;
  if (commune.population > 80000) {
    baseSavings = 1250;
  } else if (commune.population < 10000) {
    baseSavings = 1550;
  }
  const savingsEstimate = `environ ${baseSavings.toLocaleString('fr-FR')} € à ${(baseSavings + 250).toLocaleString('fr-FR')} € d'économie de carburant par an pour les trajets dans le secteur de {VILLE}.`;

  // Select and spin content from pools using unique seeds per field
  const rawIntro = INTRO_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 10, INTRO_POOLS[resolvedCategory].length)];
  const introParagraph = spin(rawIntro, commune.slug).replaceAll('{VILLE}', commune.nom);

  const rawUseCase = USE_CASE_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 20, USE_CASE_POOLS[resolvedCategory].length)];
  const useCaseText = spin(rawUseCase, commune.slug).replaceAll('{VILLE}', commune.nom);

  const rawEco = ECO_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 30, ECO_POOLS[resolvedCategory].length)];
  const ecoText = spin(rawEco, commune.slug).replaceAll('{VILLE}', commune.nom);

  const rawCommuneData = COMMUNE_DATA_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 40, COMMUNE_DATA_POOLS[resolvedCategory].length)];
  const communeDataInsight = spin(rawCommuneData, commune.slug).replaceAll('{VILLE}', commune.nom);

  const rawExpertTip = EXPERT_TIP_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 50, EXPERT_TIP_POOLS[resolvedCategory].length)];
  const expertTip = spin(rawExpertTip, commune.slug).replaceAll('{VILLE}', commune.nom);

  const rawRealEstate = REAL_ESTATE_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 60, REAL_ESTATE_POOLS[resolvedCategory].length)];
  const realEstateInsight = spin(rawRealEstate, commune.slug).replaceAll('{VILLE}', commune.nom);

  const rawPopTier = POPULATION_TIER_POOLS[resolvedCategory][getVariantIndex(commune.slug, catOffset + 70, POPULATION_TIER_POOLS[resolvedCategory].length)];
  const populationTierContent = spin(rawPopTier, commune.slug).replaceAll('{VILLE}', commune.nom);

  // FAQ generation with rotation (select 6 items per commune for more diversity)
  const rawFaqList = FAQ_POOLS[resolvedCategory];
  const selectedFaqs = selectRotatedItems(rawFaqList, commune.slug, catOffset, 6);
  const faqItems = selectedFaqs.map(faq => ({
    question: spin(faq.question, commune.slug).replaceAll('{VILLE}', commune.nom),
    answer: spin(faq.answer, commune.slug).replaceAll('{VILLE}', commune.nom)
  }));

  // Dynamic logisticsAlert pool (was static identical on all 381 pages)
  const logisticsAlertPools = [
    `⚠️ **Certification obligatoire** : L'installation d'une borne de puissance supérieure à 3.7 kW à ${commune.nom} doit obligatoirement être réalisée par un professionnel qualifié IRVE. Sans cette qualification, vos assurances sont nulles en cas de sinistre électrique.`,
    `⚠️ **Obligation légale (${commune.codePostal})** : L'article L. 221-7 du Code de l'énergie impose le recours à un installateur certifié IRVE pour toute borne dépassant 3.7 kW. À ${commune.nom}, nos partenaires possèdent cette qualification et assurent une conformité NF C 15-100.`,
    `⚠️ **Exigence réglementaire** : À ${commune.nom}, comme dans tout le Rhône, poser soi-même une borne de plus de 3.7 kW sans qualification IRVE invalide la garantie constructeur de votre véhicule électrique et votre couverture d'assurance habitation.`,
    `⚠️ **Rappel normatif** : La pose d'une wallbox à ${commune.nom} nécessite un professionnel titulaire de la mention IRVE (P1/P2). Cette certification garantit la conformité de l'installation aux normes en vigueur et l'éligibilité au crédit d'impôt de 500 €.`,
    `⚠️ **Sécurité & Conformité** : Dans le département du Rhône, seuls les électriciens qualifiés IRVE peuvent raccorder une borne de recharge au tableau principal. À ${commune.nom}, cette exigence s'applique aux puissances supérieures à 3.7 kW, sous peine d'exclusion des aides financières.`,
    `⚠️ **Information essentielle** : Le Consuel (Comité national pour la sécurité des usagers de l'électricité) peut exiger un contrôle de conformité de votre installation de borne à ${commune.nom}. Seul un installateur certifié IRVE garantit la validation de ce contrôle.`
  ];
  const logisticsAlert = logisticsAlertPools[getVariantIndex(commune.slug, catOffset + 80, logisticsAlertPools.length)];

  // Dynamic pricesContext pool (was static identical on all pages)
  const pricesContextPools = [
    `Les tarifs indiqués correspondent à une pose standard (câble ≤ 10 m entre tableau et borne) à ${commune.nom}. Les prix peuvent varier selon la mise aux normes du tableau électrique, les travaux de terrassement ou les spécificités du bâti local.`,
    `Ces prix incluent la fourniture de la wallbox, le câblage et les protections électriques obligatoires pour une installation à ${commune.nom}. Un surcoût peut s'appliquer en cas de distance importante entre le tableau et le point de charge (au-delà de 15 mètres).`,
    `Tarifs constatés par nos installateurs partenaires dans le secteur de ${commune.nom} en 2026. Le prix final dépend de la configuration de votre logement (distance tableau-borne, accessibilité, nécessité d'un passage en triphasé auprès d'Enedis Rhône).`,
    `Prix moyens TTC relevés pour les installations réalisées dans le département du Rhône, ajustés pour le secteur de ${commune.nom}. La visite technique gratuite de nos partenaires IRVE permet d'affiner ce devis en fonction de votre installation existante.`,
    `Ces estimations budgétaires pour ${commune.nom} sont données à titre indicatif et incluent main-d'œuvre, matériel et protections électriques réglementaires. Un chiffrage personnalisé est remis gratuitement après visite technique de votre domicile.`,
    `Barème indicatif 2026 pour le secteur de ${commune.nom} (${commune.codePostal}). Les coûts peuvent être réduits de 500 € à 1 460 € grâce au cumul du crédit d'impôt et de la prime ADVENIR, selon votre situation.`
  ];
  const pricesContext = pricesContextPools[getVariantIndex(commune.slug, catOffset + 85, pricesContextPools.length)];

  // Dynamic tableIntro pool (was only 3 variants for 381 pages)
  const tableIntroPools = {
    main: [
      `Voici un récapitulatif des coûts moyens constatés pour l'installation d'équipements de charge à ${commune.nom} en 2026 :`,
      `Nos installateurs certifiés IRVE communiquent les barèmes de prix suivants pour la pose d'une borne de recharge dans le secteur de ${commune.nom} :`,
      `Budget à prévoir pour s'équiper d'une solution de recharge à domicile à ${commune.nom} — tarifs TTC avant déduction des aides financières :`,
      `Grille tarifaire indicative pour une installation de borne de recharge résidentielle dans la commune de ${commune.nom} (${commune.codePostal}) :`
    ],
    copropriete: [
      `Voici un récapitulatif des coûts indicatifs pour équiper vos stationnements en copropriété à ${commune.nom} :`,
      `Budget prévisionnel pour l'installation d'une borne de recharge en résidence collective à ${commune.nom} — tarifs TTC par point de charge :`,
      `Estimation des coûts d'installation de bornes de recharge en copropriété dans le secteur de ${commune.nom}, avant déduction des aides ADVENIR :`,
      `Tarifs moyens constatés pour les installations en parking collectif et en pied d'immeuble à ${commune.nom} :`
    ],
    wallbox: [
      `Voici un comparatif des coûts moyens et des performances constatées pour l'installation d'une borne wallbox à ${commune.nom} :`,
      `Tableau comparatif des puissances et des tarifs d'installation de wallbox résidentielles disponibles dans le secteur de ${commune.nom} :`,
      `Budget complet (fourniture + pose) pour une wallbox à domicile à ${commune.nom} — prix TTC constatés par nos installateurs certifiés :`,
      `Grille de prix et performances des bornes wallbox installées par nos partenaires IRVE dans la commune de ${commune.nom} :`
    ]
  };
  const tableIntro = tableIntroPools[resolvedCategory][getVariantIndex(commune.slug, catOffset + 90, tableIntroPools[resolvedCategory].length)];

  // ===== NEW DYNAMIC SEO FIELDS =====
  
  // 1. Infrastructure density analysis (unique per commune via real data)
  const densiteBornesVal = commune.densiteBornes || 0;
  const densiteQualif = densiteBornesVal >= 1.0 ? 'bien desservie' : densiteBornesVal >= 0.5 ? 'moyennement équipée' : 'sous-équipée';
  const densiteAnalysis = `${commune.nom} dispose actuellement de ${commune.bornesPubliques || 0} bornes de recharge publiques pour ${commune.population?.toLocaleString('fr-FR')} habitants, soit une densité de ${densiteBornesVal} points de charge pour 1 000 habitants. Cette commune est donc ${densiteQualif} en infrastructure IRVE publique. Avec une croissance de ${commune.croissanceVE || 25}% des immatriculations de véhicules électriques par an, l'installation de bornes de recharge privées est essentielle pour absorber la demande croissante et éviter la saturation des stations publiques locales.`;

  // 2. Real estate market insight (unique per commune via prixM2, profil, tauxMaison)
  const marcheImmobilierInsight = `Le marché immobilier de ${commune.nom} est classé « ${commune.marcheImmobilier || 'intermédiaire'} » avec un prix moyen au m² de ${commune.prixM2Moyen?.toLocaleString('fr-FR') || 'N/A'} €. Dans ce contexte de marché ${commune.marcheImmobilier || 'intermédiaire'}, l'habitat ${commune.tauxMaisonLabel || 'résidentiel'} (${commune.logementsMaison}% de maisons individuelles sur ${commune.logements?.toLocaleString('fr-FR')} logements) rend l'installation d'une borne de recharge techniquement simple dans la majorité des cas, avec un accès direct au compteur électrique et un garage ou une allée privée.`;

  // 3. Distance to Lyon context (unique per commune)
  const distVal = commune.distanceLyon || 0;
  let distanceLyonContext: string;
  if (distVal <= 5) {
    distanceLyonContext = `${commune.nom} est situé au cœur de la métropole lyonnaise. La proximité immédiate avec le centre de Lyon impose les contraintes de la ZFE (Zone à Faibles Émissions) et renforce l'urgence de passer à un véhicule électrique. Disposer d'une borne de recharge à domicile est ici non seulement un confort, mais une nécessité pour circuler sans restriction dans l'hypercentre lyonnais.`;
  } else if (distVal <= 15) {
    distanceLyonContext = `À seulement ${distVal} km du centre de Lyon, ${commune.nom} est directement concernée par le périmètre de la ZFE du Grand Lyon. Les résidents qui effectuent des trajets quotidiens vers la Presqu'île, la Part-Dieu ou Gerland ont tout intérêt à passer à l'électrique et à s'équiper d'une borne de recharge à domicile pour des recharges nocturnes économiques.`;
  } else if (distVal <= 30) {
    distanceLyonContext = `${commune.nom} se situe à ${distVal} km du centre de Lyon, en périphérie de la métropole. Les navetteurs qui rejoignent chaque jour les pôles d'emploi lyonnais parcourent un trajet aller-retour de ${Math.round(distVal * 2)} km parfaitement couvert par une recharge nocturne à domicile. L'investissement dans une wallbox se rentabilise ainsi en quelques mois d'économie de carburant.`;
  } else {
    distanceLyonContext = `Située à ${distVal} km du centre de Lyon, ${commune.nom} est une commune du Rhône où la voiture reste le mode de transport dominant pour les déplacements professionnels et personnels. L'absence de transports en commun directs vers Lyon rend d'autant plus pertinent l'investissement dans un véhicule électrique rechargé à domicile, avec une autonomie quotidienne largement suffisante grâce à une borne 7.4 kW.`;
  }

  // 4. Local regulation text (varied by zone)
  const localRegulationPools = {
    'grand-lyon': [
      `La ZFE du Grand Lyon, en vigueur depuis le 1er septembre 2022, interdit progressivement les véhicules Crit'Air 5 puis 4 dans le périmètre métropolitain incluant ${commune.nom}. D'ici 2028, seuls les véhicules Crit'Air 1 et électriques pourront y circuler librement. Installer une borne de recharge à domicile est le premier pas concret pour anticiper cette réglementation.`,
      `Le Plan Climat-Air-Énergie Territorial (PCAET) de la Métropole de Lyon prévoit la multiplication par 10 des bornes de recharge privées d'ici 2030 dans le périmètre de ${commune.nom}. Les aides locales de la métropole complètent les dispositifs nationaux (ADVENIR, crédit d'impôt) pour accélérer cette transition.`
    ],
    'beaujolais-saone': [
      `Bien que ${commune.nom} ne soit pas directement incluse dans le périmètre de la ZFE du Grand Lyon, les trajets fréquents vers la métropole (accès A6, TER) incitent les résidents à anticiper les restrictions de circulation en s'équipant d'un véhicule électrique. La borne de recharge à domicile est l'investissement fondateur de cette transition dans le Beaujolais.`,
      `La communauté d'agglomération ${commune.intercommunalite || 'locale'} accompagne les communes du Beaujolais comme ${commune.nom} dans le déploiement de l'électromobilité. Les Plans Locaux d'Urbanisme (PLU) intègrent désormais des obligations de pré-câblage pour les constructions neuves.`
    ],
    'ouest-lyonnais-monts': [
      `Les communes de l'Ouest Lyonnais comme ${commune.nom} sont engagées dans le Schéma de Cohérence Territoriale (SCoT) qui encourage la réduction des émissions de CO₂ des transports. L'installation de bornes de recharge privées s'inscrit directement dans cette stratégie territoriale de décarbonation de la mobilité.`,
      `Le Plan de Déplacements Urbains (PDU) de l'agglomération lyonnaise impacte indirectement les communes périphériques comme ${commune.nom}, en favorisant les alternatives au véhicule thermique. L'Espace France Rénov' du Rhône peut vous accompagner gratuitement dans votre projet de transition vers l'électrique.`
    ]
  };
  const localRegulation = localRegulationPools[climateZone][getVariantIndex(commune.slug, catOffset + 95, localRegulationPools[climateZone].length)];

  // 5. Sources citation (varied per commune for E-E-A-T)
  const sourcesCitationPools = [
    `Sources : données INSEE ${commune.codeInsee}, barème Enedis Rhône 2026, programme ADVENIR (advenir.mobi), Service-Public.fr (crédit d'impôt borne de recharge), réglementation IRVE Qualifelec.`,
    `Données : recensement INSEE (commune ${commune.codeInsee}), grille tarifaire Enedis raccordement 2026, arrêté du 13 janvier 2021 relatif aux IRVE, base nationale data.gouv.fr des bornes publiques IRVE.`,
    `Références : fichier national IRVE (data.gouv.fr), statistiques d'immatriculation VE Rhône (SDES/RSVERO), guide Promotelec recharge électrique, décret 2020-1720 droit à la prise.`,
    `Méthodologie : prix constatés par nos partenaires installateurs IRVE dans le Rhône (69), données de population INSEE 2024 (code commune ${commune.codeInsee}), base de données AVERE France sur les immatriculations VE.`
  ];
  const sourcesCitation = sourcesCitationPools[getVariantIndex(commune.slug, catOffset + 100, sourcesCitationPools.length)];

  return {
    introParagraph,
    logisticsAlert,
    useCaseText,
    pricesContext,
    faqItems,
    ecoText,
    localContext: localContextText,
    climateZoneLabel: zoneLabels[climateZone],
    localAgencyName: agency.name,
    externalLinks: getExternalLinks(resolvedCategory, commune.codePostal, commune.slug),
    communeDataInsight,
    expertTip,
    tableIntro,
    guideLinks: getGuideLinks(resolvedCategory),
    savingsEstimate: savingsEstimate.replaceAll('{VILLE}', commune.nom),
    lastUpdated: `Juin 2026`,
    realEstateInsight,
    populationTierContent,
    // New dynamic SEO fields
    densiteAnalysis,
    marcheImmobilierInsight,
    distanceLyonContext,
    localRegulation,
    sourcesCitation
  };
}
