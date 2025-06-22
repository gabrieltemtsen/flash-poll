import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function PollCardSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-pulse">
      <CardHeader>
        <CardTitle className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="mt-2 h-4 bg-gray-200 rounded w-2/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-10 bg-gray-200 rounded" />
        ))}
      </CardContent>
    </Card>
  );
}
