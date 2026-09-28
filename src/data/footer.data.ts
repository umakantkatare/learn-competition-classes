import { MapPin, Phone, Mail } from "lucide-react";

import { Send } from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

export const supportLinks = [
  {
    label: "Help Center",
    href: "/help",
  },
  {
    label: "FAQs",
    href: "/faqs",
  },
  {
    label: "Contact Support",
    href: "/contact",
  },
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
  {
    label: "Refund Policy",
    href: "/refund-policy",
  },
];

export const quickLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Courses",
    href: "/courses",
  },
  {
    label: "Live Classes",
    href: "/live-classes",
  },
  {
    label: "Test Series",
    href: "/test-series",
  },
  {
    label: "Study Material",
    href: "/study-material",
  },
  {
    label: "About Us",
    href: "/about",
  },
];

export const popularExams = [
  {
    label: "SSC",
    href: "/courses/ssc",
  },
  {
    label: "Banking",
    href: "/courses/banking",
  },
  {
    label: "Railway",
    href: "/courses/railway",
  },
  {
    label: "Patwari",
    href: "/courses/patwari",
  },
  {
    label: "MP Police",
    href: "/courses/mp-police",
  },
  {
    label: "MP SI",
    href: "/courses/mp-si",
  },
  {
    label: "MP TET",
    href: "/courses/mp-tet",
  },
];

export const contactDetails = [
  {
    label: "Address",
    value: "Parshuram Nagar, Bhind, Madhya Pradesh, India",
    href: "https://maps.google.com/?q=Parshuram+Nagar,+Bhind,+Madhya+Pradesh,+India",
    icon: MapPin,
  },
  {
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    icon: Phone,
  },
  {
    label: "Email",
    value: "support@lccinstitute.com",
    href: "mailto:support@lccinstitute.com",
    icon: Mail,
  },
];

export const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: FaFacebook,
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagram,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: FaYoutube,
  },
  {
    name: "Telegram",
    href: "https://telegram.org",
    icon: Send,
  },
  {
    name: "WhatsApp",
    href: "https://whatsapp.com",
    icon: FaWhatsapp,
  },
];
