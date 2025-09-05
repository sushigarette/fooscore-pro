import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'

const Auth: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const getErrorMessage = (error: any) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid login credentials')) {
      return "Email ou mot de passe incorrect"
    }
    if (message.includes('email not confirmed')) {
      return "Veuillez confirmer votre email avant de vous connecter"
    }
    if (message.includes('user already registered')) {
      return "Un compte existe déjà avec cet email"
    }
    if (message.includes('password should be at least')) {
      return "Le mot de passe doit contenir au moins 6 caractères"
    }
    if (message.includes('invalid email')) {
      return "Adresse email invalide"
    }
    
    return error.message || "Une erreur est survenue"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)
      
      if (error) {
        toast({
          title: "Erreur",
          description: getErrorMessage(error),
          variant: "destructive"
        })
      } else {
        if (isSignUp) {
          toast({
            title: "Compte créé !",
            description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter."
          })
          setIsSignUp(false)
        } else {
          toast({
            title: "Connexion réussie !",
            description: "Vous êtes maintenant connecté."
          })
          navigate('/')
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'authentification.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <CardTitle className="text-2xl font-bold">MHBABY</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Créez un compte pour commencer à jouer"
              : "Connectez-vous pour commencer à jouer"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Minimum 6 caractères" : "Votre mot de passe"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Création en cours..." : "Connexion en cours..."}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {isSignUp ? "Créer le compte" : "Se connecter"}
                </>
              )}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setEmail('')
                  setPassword('')
                }}
                className="text-sm"
              >
                {isSignUp 
                  ? "Déjà un compte ? Se connecter" 
                  : "Pas de compte ? Créer un compte"
                }
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              En vous connectant, vous acceptez nos{' '}
              <a href="/terms" className="underline hover:text-primary">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="underline hover:text-primary">
                politique de confidentialité
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth 