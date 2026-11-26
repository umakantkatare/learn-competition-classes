import { MapPin, Phone, Mail } from "lucide-react";

import { Send } from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

export const supportLinks = [
  { label: "Help Center" },
  { label: "Contact Support" },
  { label: "Privacy Policy" },
  { label: "Terms & Conditions" },
  { label: "Refund Policy" },
];

export const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/batches" },
  { label: "Live Classes", href: "/live-classes" },
  { label: "Test Series", href: "/test-series" },
  { label: "Study Material", href: "/study-material" },
  { label: "About Us", href: "/about" },
];

export const popularExams = [
  { label: "SSC" },
  { label: "Defence" },
  { label: "Railway" },
  { label: "Patwari" },
  { label: "MP Police" },
  { label: "MP SI" },
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
    value: "+91 9009401613",
    href: "tel:+9009401613",
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
