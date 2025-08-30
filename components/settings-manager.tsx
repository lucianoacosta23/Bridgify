"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Shield, Bell, Wallet, Save, Info, SettingsIcon, Moon, Sun } from "lucide-react"

interface PlatformSettings {
  appearance: {
    darkMode: boolean
  }
  notifications: {
    email: boolean
    push: boolean
    transactions: boolean
    marketing: boolean
  }
  privacy: {
    shareAnalytics: boolean
    mixerEnabled: boolean
  }
  security: {
    twoFactorAuth: boolean
    biometricAuth: boolean
  }
}

export function SettingsManager() {
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    appearance: {
      darkMode: true, // Default to dark mode
    },
    notifications: {
      email: true,
      push: true,
      transactions: true,
      marketing: false,
    },
    privacy: {
      shareAnalytics: false,
      mixerEnabled: true,
    },
    security: {
      twoFactorAuth: false,
      biometricAuth: true,
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("bridgify-dark-mode")
    const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : true // Default to dark mode

    setPlatformSettings((prev) => ({
      ...prev,
      appearance: { darkMode: isDarkMode },
    }))

    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const handleAppearanceChange = (key: keyof PlatformSettings["appearance"], value: boolean) => {
    setPlatformSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }))

    if (key === "darkMode") {
      localStorage.setItem("bridgify-dark-mode", JSON.stringify(value))
      if (value) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  const handleNotificationChange = (key: keyof PlatformSettings["notifications"], value: boolean) => {
    setPlatformSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  const handlePrivacyChange = (key: keyof PlatformSettings["privacy"], value: boolean) => {
    setPlatformSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }))
  }

  const handleSecurityChange = (key: keyof PlatformSettings["security"], value: boolean) => {
    setPlatformSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [key]: value },
    }))
  }

  const saveSettings = async () => {
    setIsSaving(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("[v0] Settings saved:", { platformSettings })

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Free Service Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-xl">🎉</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Free for the Community</h3>
              <p className="text-sm text-muted-foreground">
                Bridgify is completely free to use. No hidden fees, no subscription costs - just secure crypto
                transactions for everyone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center">
            <SettingsIcon className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Wallet className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Customize your Bridgify experience and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Setting */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center">
                      {platformSettings.appearance.darkMode ? (
                        <Moon className="w-4 h-4 mr-2" />
                      ) : (
                        <Sun className="w-4 h-4 mr-2" />
                      )}
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes for better viewing comfort
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings.appearance.darkMode}
                    onCheckedChange={(value) => handleAppearanceChange("darkMode", value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={platformSettings.notifications.email}
                    onCheckedChange={(value) => handleNotificationChange("email", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={platformSettings.notifications.push}
                    onCheckedChange={(value) => handleNotificationChange("push", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Transaction Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about transaction status changes</p>
                  </div>
                  <Switch
                    checked={platformSettings.notifications.transactions}
                    onCheckedChange={(value) => handleNotificationChange("transactions", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                  </div>
                  <Switch
                    checked={platformSettings.notifications.marketing}
                    onCheckedChange={(value) => handleNotificationChange("marketing", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control how your data is used and shared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Privacy Mixer Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Privacy Mixer</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable privacy mixing for enhanced transaction anonymity (testnet only)
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings.privacy.mixerEnabled}
                    onCheckedChange={(value) => handlePrivacyChange("mixerEnabled", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Share Analytics Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve Bridgify by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings.privacy.shareAnalytics}
                    onCheckedChange={(value) => handlePrivacyChange("shareAnalytics", value)}
                  />
                </div>
              </div>

              <div className="bg-slate-900/30 dark:bg-slate-800/30 border-l-4 border-l-blue-500 dark:border-l-blue-400 rounded-r-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1 text-slate-100 dark:text-slate-200">Privacy Notice</p>
                    <p className="text-slate-300 dark:text-slate-400">
                      Bridgify is committed to protecting your privacy. We never share personal information without your
                      explicit consent and use industry-standard encryption for all data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Enhance your account security with additional protection measures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security with 2FA via authenticator app
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings.security.twoFactorAuth}
                    onCheckedChange={(value) => handleSecurityChange("twoFactorAuth", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Biometric Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Use fingerprint or face recognition for quick access
                    </p>
                  </div>
                  <Switch
                    checked={platformSettings.security.biometricAuth}
                    onCheckedChange={(value) => handleSecurityChange("biometricAuth", value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Connected Wallets</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">MetaMask</p>
                        <p className="text-sm text-muted-foreground font-mono">0x742d...5b8c</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/30 dark:bg-slate-800/30 border-l-4 border-l-yellow-600 dark:border-l-yellow-500 rounded-r-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1 text-slate-100 dark:text-slate-200">Security Recommendation</p>
                    <p className="text-slate-300 dark:text-slate-400">
                      Enable two-factor authentication for enhanced security. This helps protect your account even if
                      your password is compromised.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
