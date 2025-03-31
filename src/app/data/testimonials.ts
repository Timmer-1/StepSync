// src/app/data/testimonials.ts

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    quote: string;
    rating: number;
    avatar: string;
    imageUrl?: string; // Optional field for future use with actual profile images
}

export const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "Fitness Coach",
        company: "Elite Training",
        quote: "StepSync has transformed how I track my clients' progress. The seamless interface and detailed analytics help me provide personalized coaching like never before.",
        rating: 5,
        avatar: "SJ"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Marathon Runner",
        company: "NYC Runners Club",
        quote: "After trying dozens of fitness apps, StepSync stands out for its social features. Connecting with my running community keeps me motivated and accountable.",
        rating: 5,
        avatar: "MC"
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        role: "Wellness Director",
        company: "Horizon Health",
        quote: "We've implemented StepSync across our entire wellness program. The data insights have helped us create more effective health initiatives for our employees.",
        rating: 4,
        avatar: "ER"
    },
    {
        id: 4,
        name: "David Park",
        role: "CrossFit Enthusiast",
        company: "Peak Performance",
        quote: "The workout tracking in StepSync is incredibly detailed yet easy to use. I love being able to see my progress over time and share achievements with my gym buddies.",
        rating: 5,
        avatar: "DP"
    },
    {
        id: 5,
        name: "Jessica Williams",
        role: "Nutritionist",
        company: "Balanced Living",
        quote: "The nutrition tracking features in StepSync are a game-changer for my clients. The integration with meal planning makes healthy eating so much more manageable.",
        rating: 4,
        avatar: "JW"
    },
    {
        id: 6,
        name: "Robert Miller",
        role: "CEO",
        company: "TechFit Solutions",
        quote: "After implementing StepSync in our corporate wellness program, we've seen a 34% increase in employee participation. The ROI has been incredible.",
        rating: 5,
        avatar: "RM"
    },
    {
        id: 7,
        name: "Aisha Patel",
        role: "Yoga Instructor",
        company: "Mindful Movement",
        quote: "StepSync's meditation and mindfulness features complement my yoga practice perfectly. My students love tracking their progress in both physical and mental wellness.",
        rating: 4,
        avatar: "AP"
    },
    {
        id: 8,
        name: "Thomas Wilson",
        role: "Physical Therapist",
        company: "Recovery First",
        quote: "I recommend StepSync to all my patients for rehabilitation tracking. The ability to monitor progress and share it directly with healthcare providers is invaluable.",
        rating: 5,
        avatar: "TW"
    },
    {
        id: 9,
        name: "Olivia Martinez",
        role: "College Student",
        company: "University Fitness Club",
        quote: "StepSync has made fitness challenges with my friends so much fun! The competitive elements keep me motivated, and I've beaten my personal records month after month.",
        rating: 5,
        avatar: "OM"
    }
];

export function getRandomTestimonials(count: number = 3): Testimonial[] {
    if (count >= testimonials.length) return testimonials;

    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export function getFeaturedTestimonials(count: number = 3): Testimonial[] {
    const featured = testimonials.filter(t => t.rating === 5);
    if (count >= featured.length) return featured;

    const shuffled = [...featured].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}