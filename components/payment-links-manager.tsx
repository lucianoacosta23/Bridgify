"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Link, QrCode, Copy, Check, Eye, Trash2, Plus } from "lucide-react"
import { PaymentLinkForm } from "./payment-link-form"

// Clave para guardar los links en localStorage
const PAYMENT_LINKS_STORAGE_KEY = 'bridgify_payment_links'

interface PaymentLink {
  id: string
  amount: number
  currency: string
  description?: string
  url: string
  qrData: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  clicks?: number
  payments?: number
}

// Función para generar un ID único
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function PaymentLinksManager() {
  // Cargar links guardados al inicializar
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  
  // Cargar los links del localStorage solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PAYMENT_LINKS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPaymentLinks(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading payment links:', error);
        localStorage.removeItem(PAYMENT_LINKS_STORAGE_KEY);
      }
    }
  }, []);

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Efecto para guardar los links en localStorage cuando cambian
  useEffect(() => {
    if (typeof window !== 'undefined' && paymentLinks.length > 0) {
      try {
        console.log('Saving to localStorage:', paymentLinks);
        localStorage.setItem(PAYMENT_LINKS_STORAGE_KEY, JSON.stringify(paymentLinks));
      } catch (error) {
        console.error('Error saving payment links:', error);
      }
    }
  }, [paymentLinks]);

  const handleLinkCreated = (newLink: PaymentLink) => {
    console.log('New link to be added:', newLink);
    setPaymentLinks(prev => {
      const updated = [newLink, ...prev];
      console.log('Updated links:', updated);
      return updated;
    });
  }

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this payment link?')) {
      setPaymentLinks(prev => prev.filter(link => link.id !== id));
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Links</h2>
          <p className="text-muted-foreground">Create and manage your payment links</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Links</p>
                <p className="text-2xl font-bold text-foreground">
                  {paymentLinks.filter((link) => link.isActive && !isExpired(link.expiresAt)).length}
                </p>
              </div>
              <Link className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold text-foreground">
                  {paymentLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful Payments</p>
                <p className="text-2xl font-bold text-foreground">
                  {paymentLinks.reduce((sum, link) => sum + (link.payments || 0), 0)}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Links List */}
      <div className="space-y-4">
        {paymentLinks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No payment links yet</h3>
              <p className="text-muted-foreground mb-4">Create your first payment link to get started</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Payment Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          paymentLinks.map((link) => (
            <Card key={link.id} className="hover:bg-accent/5 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {link.amount} {link.currency}
                      </Badge>
                      {isExpired(link.expiresAt) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {link.clicks || 0} clicks • {link.payments || 0} payments
                      </span>
                    </div>

                    {link.description && <p className="text-sm text-foreground mb-2">{link.description}</p>}

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                      <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedLink(link)}>
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.url, link.id)}>
                      {copied === link.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Payment Link Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Create Payment Link</DialogTitle>
          </DialogHeader>
          <PaymentLinkForm onClose={() => setShowCreateForm(false)} onLinkCreated={handleLinkCreated} />
        </DialogContent>
      </Dialog>

      {/* QR Code View Dialog */}
      <Dialog open={!!selectedLink} onOpenChange={() => setSelectedLink(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Payment Link QR Code</DialogTitle>
          </DialogHeader>
          {selectedLink && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Payment QR Code</CardTitle>
                <CardDescription className="text-center">
                  Scan to pay {selectedLink.amount} {selectedLink.currency}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-24 h-24 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">QR Code</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLink.amount} {selectedLink.currency}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">{selectedLink.url}</p>
                  {selectedLink.description && (
                    <p className="text-sm text-muted-foreground">{selectedLink.description}</p>
                  )}
                </div>

                <Button
                  onClick={() => copyToClipboard(selectedLink.url, selectedLink.id)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Payment Link
                </Button>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
