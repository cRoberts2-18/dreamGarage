'use client'

import Modal from '@/components/ui/modal'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { login } from '@/app/_user/repo'

export default function Home() {
  const [username, setUsername] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async () => {
    setIsLoading(true)
    try {
      await login(username, password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal showModal={true} title="Dream Garage" onClose={() => null}>
      <h3 className="text-center">Login</h3>
      <div className="flex justify-center items-center h-75">
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
              <FieldLabel htmlFor="fieldgroup-password">password</FieldLabel>
              <Input
                id="fieldgroup-password"
                type="password"
                placeholder="password..."
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading} className="min-w-20">
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  'Login'
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </Modal>
  )
}
