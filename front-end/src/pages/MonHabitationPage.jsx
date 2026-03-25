import { Link } from 'react-router-dom'

const garanties = [
  {
    icon: '🏠',
    title: 'Incendie & explosion',
    desc: 'Couvrez les dégâts liés aux incendies et événements imprévus dans votre logement.'
  },
  {
    icon: '💧',
    title: 'Dégâts des eaux',
    desc: 'Protection en cas de fuite, infiltration ou rupture de canalisation.'
  },
  {
    icon: '🔐',
    title: 'Vol & vandalisme',
    desc: 'Sécurisez votre habitation et vos biens contre les actes malveillants.'
  }
]

const services = [
  {
    title: 'Déclaration sinistre habitation',
    desc: 'Déclarez rapidement votre sinistre et joignez vos documents en ligne.',
    img: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Expertise à domicile',
    desc: 'Un accompagnement rapide pour évaluer les dommages de votre logement.',
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Suivi de remboursement',
    desc: 'Suivez le traitement de votre dossier et l’état de votre indemnisation.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
  }
]

const chiffres = [
  { value: '24/7', label: 'Assistance habitation' },
  { value: '72h', label: 'Traitement du dossier' },
  { value: '160', label: 'Agences disponibles' },
  { value: '92%', label: 'Clients satisfaits' }
]

const etapes = [
  {
    step: '01',
    title: 'Déclarer les dégâts',
    desc: 'Décrivez le sinistre habitation et précisez le lieu, la date et le contrat.'
  },
  {
    step: '02',
    title: 'Envoyer justificatifs',
    desc: 'Ajoutez les photos et documents utiles pour accélérer l analyse du dossier.'
  },
  {
    step: '03',
    title: 'Suivre la prise en charge',
    desc: 'Consultez le statut, la décision et l indemnisation depuis votre espace client.'
  }
]

export default function MonHabitationPage() {
  return (
    <main>
      <section className="section container products-section">
        <p className="section-kicker">Mon habitation</p>
        <h1 className="section-title">Protégez votre logement et vos biens</h1>
        <div className="news-block">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80"
            alt="Assurance habitation"
          />
          <div>
            <p className="news-tag">Protection logement</p>
            <h4>Une couverture complète pour votre maison</h4>
            <p>Choisissez la formule adaptée à votre habitation et gagnez en sérénité au quotidien.</p>
            <Link to="/declaration-sinistre?type=HABITATION" className="nav-btn primary-btn devis-btn">
              Déclarer un sinistre
            </Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <p className="section-kicker">Nos garanties</p>
        <div className="product-grid">
          {garanties.map((item) => (
            <article className="product-card" key={item.title}>
              <span className="product-icon">{item.icon}</span>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <p className="section-kicker">Services habitation</p>
        <h2 className="section-title">Un accompagnement clair en cas de sinistre</h2>
        <div className="demarche-grid">
          {services.map((item) => (
            <article className="demarche-card" key={item.title}>
              <img src={item.img} alt={item.title} />
              <div className="demarche-body">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container offer-flow-section">
        <p className="section-kicker">Parcours sinistre</p>
        <h2 className="section-title">Comment traiter votre dossier habitation</h2>
        <div className="offer-flow-grid">
          {etapes.map((item) => (
            <article className="offer-flow-card" key={item.step}>
              <span className="offer-flow-step">{item.step}</span>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container stats-layout">
          <div>
            <h2 className="section-title left">Déclarer un sinistre habitation</h2>
            <p className="text-muted">
              Envoyez vos justificatifs et suivez chaque étape de votre dossier depuis votre espace client.
            </p>
            <Link to="/declaration-sinistre?type=HABITATION" className="nav-btn primary-btn">
              Commencer la déclaration
            </Link>
          </div>
          <div className="stats-grid-2">
            {chiffres.map((item) => (
              <article className="stat-box" key={item.label}>
                <h4>{item.value}</h4>
                <p>{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
