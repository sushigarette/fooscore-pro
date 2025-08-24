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
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const { error } = await signIn(email)
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setIsEmailSent(true)
        toast({
          title: "Email envoyé !",
          description: "Vérifiez votre boîte mail pour le code de connexion."
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
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
          <CardTitle className="text-2xl font-bold">FooScore Pro</CardTitle>
          <CardDescription>
            {isEmailSent 
              ? "Vérifiez votre email pour continuer"
              : "Connectez-vous pour commencer à jouer"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isEmailSent ? (
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
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le code de connexion
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Un email avec un code de connexion a été envoyé à <strong>{email}</strong>.
                  Cliquez sur le lien dans l'email pour vous connecter.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsEmailSent(false)
                  setEmail('')
                }}
              >
                Utiliser un autre email
              </Button>
            </div>
          )}
          
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