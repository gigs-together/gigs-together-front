import { Card, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg mb-2">Welcome</CardTitle>
            <p className="text-gray-600">
              Welcome to the Gigs Together admin panel. Use the navigation menu to manage users and
              events.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg mb-2">Quick Actions</CardTitle>
            <div className="space-y-2">
              <button className="block w-full text-left text-blue-600 hover:text-blue-800">
                Create New Event
              </button>
              <button className="block w-full text-left text-blue-600 hover:text-blue-800">
                Manage Users
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg mb-2">System Status</CardTitle>
            <div className="text-green-600">✓ All systems operational</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
