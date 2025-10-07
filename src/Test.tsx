import { Button } from "@/components/ui/button"
import "./Test.css"

function Test() {
  return (
    <div className="test-page">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">Test Page</h1>
          <p className="text-lg text-gray-600">
            This is a test page showcasing the shadcn Button component
          </p>
          <div className="space-y-4">
            <div>
              <Button>Click me</Button>
            </div>
            <div className="space-x-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="space-x-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Test