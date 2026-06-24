"use client";

import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/components/providers/locale-provider";

interface CertificatesClientProps {
  certificates: Array<{
    id: string;
    certificateUrl: string | null;
    issuedAt: string;
    course: {
      id: string;
      title: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
}

export function CertificatesClient({ certificates }: CertificatesClientProps) {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t.academy.certificate}</h1>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No certificates yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete a course to earn your certificate
            </p>
            <ButtonLink href="/academy/my-courses">Go to My Courses</ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[1.4] bg-gradient-to-br from-primary/10 to-primary/5 relative flex items-center justify-center">
                {cert.course.imageUrl ? (
                  <img src={cert.course.imageUrl} alt={cert.course.title} className="w-full h-full object-cover opacity-20" />
                ) : null}
                <Award className="h-16 w-16 text-primary absolute" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{cert.course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex gap-2">
                  {cert.certificateUrl ? (
                    <ButtonLink size="sm" variant="outline" className="flex-1" href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 ml-2" />
                      View
                    </ButtonLink>
                  ) : null}
                  <ButtonLink size="sm" className="flex-1" href={`/academy/courses/${cert.course.slug}`}>
                    {t.academy.courseDetails}
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
