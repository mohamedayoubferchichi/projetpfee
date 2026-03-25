import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ALLOWED_TYPES = ['AUTO', 'HABITATION', 'VOYAGE', 'PREVOYANCE']

const createInitialForm = (typeSinistre = 'AUTO') => ({
  typeSinistre,
  numeroContrat: '',
  dateIncident: '',
  lieuIncident: '',
  description: ''
})

export default function DeclarationSinistrePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const selectedType = useMemo(() => {
    const type = (searchParams.get('type') || '').toUpperCase()
    return ALLOWED_TYPES.includes(type) ? type : 'AUTO'
  }, [searchParams])

  const [form, setForm] = useState(() => createInitialForm(selectedType))
  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }
      try {
        const response = await axios.get('http://localhost:8080/api/utilisateurs/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUserProfile(response.data)
        setForm(prev => ({
          ...prev,
          numeroContrat: response.data.numeroContrat || '',
          typeSinistre: selectedType
        }))
      } catch (err) {
        console.error("Erreur profile:", err)
        setError("Impossible de charger votre profil. Veuillez vous reconnecter.")
      }
    }
    fetchProfile()
  }, [selectedType, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (event) => {
    setPhotos(Array.from(event.target.files || []))
  }

  const handleDocumentChange = (event) => {
    setDocuments(Array.from(event.target.files || []))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setAiResult(null)

    const token = localStorage.getItem('token')
    if (!token || !userProfile) {
      setError("Session expirée. Veuillez vous reconnecter.")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('cin', userProfile.cin)
      formData.append('typeSinistre', form.typeSinistre)
      formData.append('description', form.description)
      formData.append('lieu', form.lieuIncident)
      // Formatter la date en ISO (ex: 2026-03-23T00:00:00) car le back attend un LocalDateTime
      formData.append('date', `${form.dateIncident}T00:00:00`)

      if (photos.length > 0) {
        formData.append('image', photos[0]) // On envoie la première photo pour l'IA Estimator
      }

      const response = await axios.post('http://localhost:8080/api/sinistres/declarer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })

      setAiResult(response.data)
      setForm(createInitialForm(selectedType))
      setPhotos([])
      setDocuments([])
    } catch (err) {
      console.error("Erreur lors de la déclaration:", err)
      setError("Une erreur est survenue lors de l'analyse IA de votre sinistre.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="sinistre-page">
      <section className="section container products-section">
        <p className="section-kicker">Declaration sinistre</p>
        <h1 className="section-title">Declarez votre dossier en ligne</h1>
        <p className="text-muted sinistre-intro">
          Chargez vos justificatifs et photos. Cette page est une version front-end conforme au cahier de charge.
        </p>
      </section>

      <section className="section container">
        <article className="auth-card sinistre-card">
          <h2>Formulaire de declaration</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Type de sinistre
              <select name="typeSinistre" value={form.typeSinistre} onChange={handleChange}>
                <option value="AUTO">Accident automobile</option>
                <option value="HABITATION">Sinistre habitation</option>
                <option value="VOYAGE">Sinistre voyage</option>
                <option value="PREVOYANCE">Sinistre prevoyance</option>
              </select>
            </label>

            <label>
              Numero contrat
              <input
                name="numeroContrat"
                value={form.numeroContrat}
                onChange={handleChange}
                placeholder="Ex: CTR-2026-001"
                required
              />
            </label>

            <label>
              Date de l'incident
              <input
                type="date"
                name="dateIncident"
                value={form.dateIncident}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Lieu de l'incident
              <input
                name="lieuIncident"
                value={form.lieuIncident}
                onChange={handleChange}
                placeholder="Ville, adresse..."
                required
              />
            </label>

            <label>
              Description du sinistre
              <textarea
                className="contact-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Expliquez ce qui s'est passe..."
                required
              />
            </label>

            <div className="sinistre-upload-grid">
              <label>
                Photos de l'accident
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                <small>{photos.length} fichier(s) selectionne(s)</small>
              </label>

              <label>
                Documents (contrat, facture...)
                <input type="file" multiple onChange={handleDocumentChange} />
                <small>{documents.length} fichier(s) selectionne(s)</small>
              </label>
            </div>

            <button type="submit" className="primary auth-submit" disabled={isLoading}>
              {isLoading ? 'Analyse IA en cours...' : 'Envoyer la déclaration'}
            </button>
          </form>

          {error ? <p className="auth-switch error-message">{error}</p> : null}

          {aiResult && (
            <div className="ai-result-card">
              <h3 className="ai-result-title">Analyse Instantanée AssurGo AI</h3>
              <div className="ai-result-content">
                <p><strong>Catégorie identifiée :</strong> {aiResult.typeSinistre}</p>
                <div className="ai-analysis-text">
                  {aiResult.aiAnalysis}
                </div>
                <div className="ai-confidence-badge">
                  Confiance : {aiResult.scoreConfiance}%
                </div>
              </div>
              <p className="ai-status-note">
                Votre dossier a été enregistré avec le statut : <strong>{aiResult.statut}</strong>.
                Un agent humain validera ces informations prochainement.
              </p>
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
