'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TeamMember {
  id: string;
  name: string;
  user_email: string;
  image?: string;
  role?: string;
  status?: string;
}

const getInitials = (name: string, email: string) =>
  (name || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const TeamSection = () => {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/team/fetch')
      if (res.ok) {
        const data = await res.json()
        setTeam(data.team ?? [])
      }
    } catch (err) {
      console.error('Team member fetching error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const handleAddMember = async () => {
    const email = newMemberEmail.trim()
    if (!email) {
      setError('Email is required.')
      return
    }

    setError(null)
    setIsAdding(true)
    try {
      const res = await fetch('/api/team/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: newMemberName.trim() }),
      })

      if (res.ok) {
        setNewMemberEmail('')
        setNewMemberName('')
        setOpenDialog(false)
        fetchTeam()
      } else {
        setError('Could not add the member. Please try again.')
      }
    } catch (err) {
      console.error('Failed to add member:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="border-white/5 bg-[#0a0a0e]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-white">
            Team Members
          </CardTitle>
          <CardDescription>Manage your team and their access.</CardDescription>
        </div>

        <Button
          size="sm"
          className="bg-white text-black hover:bg-zinc-200"
          onClick={() => setOpenDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            Loading team...
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-zinc-500">
            <Users className="w-8 h-8 text-zinc-600" />
            <p className="text-sm">No team members found!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/1 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {member.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-9 w-9 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full border border-white/10 bg-zinc-800 text-zinc-400 text-xs flex items-center justify-center">
                      {getInitials(member.name, member.user_email) || 'UN'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {member.name || 'Unknown'}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'capitalize border shadow-none',
                          member.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                        )}
                      >
                        {member.status ?? 'invited'}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500">{member.user_email}</p>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className="bg-white/5 capitalize text-zinc-400 hover:bg-white/10 border-white/5 shadow-none"
                >
                  {member.role ?? 'member'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-[#0E0E12] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a new member to your organization. They will be added
              immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-300">
                Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              className="border-white/10 text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={isAdding}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default TeamSection