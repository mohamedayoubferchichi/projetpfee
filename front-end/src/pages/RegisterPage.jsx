import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    telephone: '',
    cin: '',
    numeroContrat: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.nom.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Veuillez remplir nom, email et mot de passe.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/utilisateur/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          telephone: formData.telephone.trim(),
          cin: formData.cin.trim(),
          numeroContrat: formData.numeroContrat.trim()
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Impossible de créer le compte.')
      }

      setSuccess('Compte créé avec succès. Redirection vers la connexion...')
      setTimeout(() => {
        navigate('/se-connecter')
      }, 1000)
    } catch (submitError) {
      setError(submitError.message || 'Erreur lors de la création du compte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Créer un compte</h1>
        <p>Inscrivez-vous pour déclarer un sinistre en ligne.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nom *
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
            />
          </label>
          <label>
            Mot de passe *
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </label>
          <label>
            Téléphone
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Votre numéro de téléphone"
            />
          </label>
          <label>
            CIN
            <input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              placeholder="Votre CIN"
            />
          </label>
          <label>
            Numéro de contrat
            <input
              type="text"
              name="numeroContrat"
              value={formData.numeroContrat}
              onChange={handleChange}
              placeholder="Votre numéro de contrat"
            />
          </label>
          {error ? <p className="auth-switch">{error}</p> : null}
          {success ? <p className="auth-switch">{success}</p> : null}
          <button type="submit" className="primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer un compte'}
          </button>
        </form>
        <p className="auth-switch">
          Vous avez déjà un compte ? <Link to="/se-connecter">Se connecter</Link>
        </p>
      </section>
    </main>
  )
}
