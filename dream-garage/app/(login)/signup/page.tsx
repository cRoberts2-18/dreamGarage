'use client'

import Modal from '@/components/ui/modal'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { signUp } from '@/app/_user/repo'
import Link from 'next/link'

export default function SignUp() {
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const errorMessage = await signUp(username, email, password)
      if (errorMessage) setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal showModal={true} title="Sign Up" onClose={() => null} hideClose>
      <div className="flex justify-center">
        <form
          className="w-75"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <FieldGroup className="text-center">
            <Field>
              <FieldLabel htmlFor="fieldgroup-username">Username</FieldLabel>
              <Input
                id="fieldgroup-username"
                placeholder="username..."
                onChange={(e) => setUsername(e.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
              <Input
                id="fieldgroup-email"
                type="email"
                placeholder="email..."
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
              <Input
                id="fieldgroup-password"
                type="password"
                placeholder="password..."
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </Field>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Field>
              <Button type="submit" disabled={isLoading} className="min-w-20">
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  'Sign Up'
                )}
              </Button>
            </Field>
            <Field>
              <p className="text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Log in
                </Link>
              </p>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </Modal>
  )
}
