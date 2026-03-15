import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Tag, User, RefreshCw, Clock, CheckCircle2, HelpCircle, Banknote, Lock, ArrowUpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const surveys = [
  {
    id: 1, name: "Kenya Consumer Lifestyle", questions: 8, payout: 95,
    questionList: [
      { q: "How often do you eat out at restaurants per week?", options: ["Never", "1-2 times", "3-5 times", "More than 5 times"] },
      { q: "What is your preferred mode of entertainment?", options: ["Streaming services", "Live events", "Social media", "Reading"] },
      { q: "How much do you spend on groceries monthly?", options: ["Less than Ksh 5,000", "Ksh 5,000 - 10,000", "Ksh 10,000 - 20,000", "Over Ksh 20,000"] },
      { q: "Which supermarket chain do you shop at most?", options: ["Naivas", "Quickmart", "Carrefour", "Local market"] },
      { q: "How often do you exercise per week?", options: ["Never", "1-2 times", "3-4 times", "Daily"] },
      { q: "What type of housing do you live in?", options: ["Apartment/Flat", "Bungalow", "Maisonette", "Bedsitter"] },
      { q: "How do you primarily commute to work?", options: ["Matatu", "Personal car", "Boda boda", "Walking"] },
      { q: "What is your age range?", options: ["18-24", "25-34", "35-44", "45+"] },
    ],
  },
  {
    id: 2, name: "M-Pesa Usage Patterns", questions: 7, payout: 85,
    questionList: [
      { q: "How many M-Pesa transactions do you make daily?", options: ["1-3", "4-7", "8-12", "More than 12"] },
      { q: "What do you use M-Pesa for most?", options: ["Sending money", "Paying bills", "Buying goods", "Savings (M-Shwari)"] },
      { q: "How much do you transact via M-Pesa monthly?", options: ["Under Ksh 10,000", "Ksh 10,000-50,000", "Ksh 50,000-100,000", "Over Ksh 100,000"] },
      { q: "Do you use M-Pesa's Fuliza overdraft service?", options: ["Yes, regularly", "Sometimes", "Rarely", "Never"] },
      { q: "Have you used M-Pesa to pay for online shopping?", options: ["Yes, frequently", "A few times", "Once or twice", "Never"] },
      { q: "How satisfied are you with M-Pesa charges?", options: ["Very satisfied", "Somewhat satisfied", "Neutral", "Dissatisfied"] },
      { q: "Would you switch to another mobile money platform?", options: ["Definitely yes", "Maybe", "Probably not", "Never"] },
    ],
  },
  {
    id: 3, name: "Digital Banking in Kenya", questions: 9, payout: 120,
    questionList: [
      { q: "Do you have a bank account?", options: ["Yes, one bank", "Yes, multiple banks", "No, M-Pesa only", "No bank or mobile money"] },
      { q: "Which bank do you primarily use?", options: ["Equity Bank", "KCB", "Co-operative Bank", "Other"] },
      { q: "How often do you visit a physical bank branch?", options: ["Weekly", "Monthly", "Rarely", "Never"] },
      { q: "Do you use mobile banking apps?", options: ["Daily", "Weekly", "Monthly", "Never"] },
      { q: "What feature matters most in a banking app?", options: ["Easy transfers", "Loan access", "Bill payments", "Investment options"] },
      { q: "Have you ever taken a digital loan?", options: ["Yes, multiple times", "Once or twice", "No, but considering", "No, never"] },
      { q: "How much do you save monthly?", options: ["Nothing", "Under Ksh 5,000", "Ksh 5,000-20,000", "Over Ksh 20,000"] },
      { q: "Do you trust digital banking?", options: ["Completely", "Mostly", "Somewhat", "Not at all"] },
      { q: "What worries you most about digital banking?", options: ["Fraud/scams", "System downtime", "Hidden charges", "Data privacy"] },
    ],
  },
  {
    id: 4, name: "Health & Wellness Kenya", questions: 8, payout: 105,
    questionList: [
      { q: "Do you have health insurance (NHIF/SHIF)?", options: ["Yes, NHIF/SHIF", "Yes, private insurance", "Both", "None"] },
      { q: "How often do you visit a doctor?", options: ["Monthly", "Quarterly", "Annually", "Only when sick"] },
      { q: "Where do you seek medical care first?", options: ["Public hospital", "Private hospital", "Pharmacy/chemist", "Traditional healer"] },
      { q: "How much do you spend on healthcare monthly?", options: ["Under Ksh 1,000", "Ksh 1,000-5,000", "Ksh 5,000-10,000", "Over Ksh 10,000"] },
      { q: "Do you take any dietary supplements?", options: ["Yes, daily", "Sometimes", "Rarely", "Never"] },
      { q: "How would you rate your mental health?", options: ["Excellent", "Good", "Fair", "Poor"] },
      { q: "Do you have access to clean drinking water?", options: ["Always", "Most of the time", "Sometimes", "Rarely"] },
      { q: "How often do you eat fast food?", options: ["Daily", "2-3 times/week", "Once a week", "Rarely/Never"] },
    ],
  },
  {
    id: 5, name: "Smartphone & Tech Usage", questions: 7, payout: 78,
    questionList: [
      { q: "What smartphone brand do you use?", options: ["Samsung", "Tecno/Infinix", "iPhone", "Other"] },
      { q: "How much data do you use monthly?", options: ["Under 1GB", "1-5GB", "5-10GB", "Over 10GB"] },
      { q: "Which network provider do you use?", options: ["Safaricom", "Airtel", "Telkom", "Faiba"] },
      { q: "How many hours do you spend on your phone daily?", options: ["1-2 hours", "3-5 hours", "6-8 hours", "More than 8 hours"] },
      { q: "What do you use your phone for most?", options: ["Social media", "Work/Business", "Entertainment", "Communication"] },
      { q: "Do you use any streaming services?", options: ["Netflix", "YouTube Premium", "Showmax", "None"] },
      { q: "How much do you spend on airtime/data monthly?", options: ["Under Ksh 500", "Ksh 500-1,000", "Ksh 1,000-3,000", "Over Ksh 3,000"] },
    ],
  },
  {
    id: 6, name: "Online Shopping Habits", questions: 6, payout: 65,
    questionList: [
      { q: "How often do you shop online?", options: ["Weekly", "Monthly", "A few times a year", "Never"] },
      { q: "Which platform do you shop on most?", options: ["Jumia", "Kilimall", "Instagram shops", "WhatsApp sellers"] },
      { q: "What do you buy online most?", options: ["Clothing & shoes", "Electronics", "Groceries", "Beauty products"] },
      { q: "How do you pay for online purchases?", options: ["M-Pesa", "Card payment", "Cash on delivery", "Bank transfer"] },
      { q: "What stops you from shopping online more?", options: ["Delivery delays", "Trust issues", "High delivery costs", "Prefer physical stores"] },
      { q: "How much do you spend on online shopping monthly?", options: ["Under Ksh 2,000", "Ksh 2,000-5,000", "Ksh 5,000-10,000", "Over Ksh 10,000"] },
    ],
  },
  {
    id: 7, name: "Social Media Trends", questions: 7, payout: 55,
    questionList: [
      { q: "Which social media platform do you use most?", options: ["WhatsApp", "TikTok", "Instagram", "X (Twitter)"] },
      { q: "How many hours do you spend on social media daily?", options: ["Under 1 hour", "1-3 hours", "3-5 hours", "Over 5 hours"] },
      { q: "Do you follow Kenyan influencers?", options: ["Yes, many", "A few", "Not really", "No"] },
      { q: "Have you bought something because of social media ads?", options: ["Yes, often", "A few times", "Once", "Never"] },
      { q: "Do you create content on social media?", options: ["Yes, regularly", "Sometimes", "Rarely", "Never"] },
      { q: "What type of content do you engage with most?", options: ["Memes/Comedy", "News/Current affairs", "Business/Finance", "Lifestyle/Fashion"] },
      { q: "Do you trust information shared on social media?", options: ["Always", "Sometimes", "Rarely", "Never"] },
    ],
  },
  {
    id: 8, name: "Transport & Mobility", questions: 6, payout: 48,
    questionList: [
      { q: "What is your primary mode of transport?", options: ["Matatu/Bus", "Personal vehicle", "Boda boda/Motorcycle", "Walking"] },
      { q: "How much do you spend on transport daily?", options: ["Under Ksh 100", "Ksh 100-300", "Ksh 300-500", "Over Ksh 500"] },
      { q: "Do you use ride-hailing apps?", options: ["Uber", "Bolt", "Little Cab", "None"] },
      { q: "How long is your daily commute?", options: ["Under 30 min", "30-60 min", "1-2 hours", "Over 2 hours"] },
      { q: "What frustrates you most about commuting in Kenya?", options: ["Traffic jams", "High fares", "Safety concerns", "Unreliable schedules"] },
      { q: "Would you use an electric vehicle if affordable?", options: ["Definitely", "Probably", "Maybe", "No"] },
    ],
  },
  {
    id: 9, name: "Education & Skills", questions: 8, payout: 90,
    questionList: [
      { q: "What is your highest level of education?", options: ["Primary school", "Secondary school", "Diploma/Certificate", "University degree"] },
      { q: "Are you currently studying or training?", options: ["Yes, full-time", "Yes, part-time", "Online courses", "No"] },
      { q: "Have you taken any online courses?", options: ["Yes, several", "One or two", "Planning to", "Never"] },
      { q: "Which platform for online learning?", options: ["YouTube", "Coursera/Udemy", "Local platforms", "None"] },
      { q: "What skill would you most like to learn?", options: ["Digital marketing", "Programming", "Financial literacy", "Trade/Technical skill"] },
      { q: "Do you think formal education guarantees employment?", options: ["Strongly agree", "Somewhat agree", "Disagree", "Strongly disagree"] },
      { q: "How much would you invest in a course?", options: ["Under Ksh 5,000", "Ksh 5,000-15,000", "Ksh 15,000-50,000", "Over Ksh 50,000"] },
      { q: "What is your employment status?", options: ["Employed full-time", "Self-employed", "Part-time/Freelance", "Unemployed"] },
    ],
  },
  {
    id: 10, name: "Food & Agriculture", questions: 7, payout: 72,
    questionList: [
      { q: "Do you grow any of your own food?", options: ["Yes, subsistence farming", "Small garden/kitchen garden", "Plan to start", "No"] },
      { q: "Where do you buy most of your food?", options: ["Open-air market", "Supermarket", "Local kiosk/duka", "Directly from farmers"] },
      { q: "How much do you spend on food weekly?", options: ["Under Ksh 2,000", "Ksh 2,000-5,000", "Ksh 5,000-10,000", "Over Ksh 10,000"] },
      { q: "Do you eat organic/locally sourced food?", options: ["Always", "When available", "Rarely", "Never"] },
      { q: "What is your staple food?", options: ["Ugali & sukuma", "Rice & beans", "Chapati & stew", "Mixed/varies"] },
      { q: "Have food prices increased for you this year?", options: ["Significantly", "Somewhat", "Not really", "Prices decreased"] },
      { q: "Do you use food delivery apps?", options: ["Yes, frequently", "Sometimes", "Rarely", "Never"] },
    ],
  },
  {
    id: 11, name: "Financial Literacy Survey", questions: 9, payout: 110,
    questionList: [
      { q: "Do you have a monthly budget?", options: ["Yes, detailed", "Rough estimate", "I try to", "No"] },
      { q: "Do you have an emergency fund?", options: ["Yes, 3+ months", "Yes, less than 3 months", "Working on it", "No"] },
      { q: "Have you ever invested in stocks or bonds?", options: ["Yes, actively", "A few investments", "Interested but haven't", "No interest"] },
      { q: "Do you use any savings apps?", options: ["M-Shwari", "KCB M-Pesa", "Other apps", "None"] },
      { q: "What is your biggest financial challenge?", options: ["Low income", "High expenses", "Debt", "Lack of financial knowledge"] },
      { q: "Do you know about the Nairobi Securities Exchange?", options: ["Yes, I invest there", "I know about it", "Heard of it", "No idea"] },
      { q: "How do you handle unexpected expenses?", options: ["Emergency fund", "Borrow from friends/family", "Mobile loan", "Sell something"] },
      { q: "Do you have a retirement plan?", options: ["Yes, NSSF + private", "NSSF only", "Private pension", "None"] },
      { q: "Would you attend a free financial literacy workshop?", options: ["Definitely", "Probably", "Maybe", "Not interested"] },
    ],
  },
  {
    id: 12, name: "Climate & Environment", questions: 6, payout: 58,
    questionList: [
      { q: "How concerned are you about climate change?", options: ["Very concerned", "Somewhat concerned", "Not very concerned", "Not at all"] },
      { q: "Have you experienced effects of climate change?", options: ["Yes, drought", "Yes, flooding", "Yes, unpredictable weather", "Not sure"] },
      { q: "Do you recycle or sort waste?", options: ["Always", "Sometimes", "Rarely", "Never"] },
      { q: "What energy source do you use for cooking?", options: ["LPG gas", "Charcoal/firewood", "Electricity", "Biogas"] },
      { q: "Would you pay more for eco-friendly products?", options: ["Yes, definitely", "Depends on price", "Probably not", "No"] },
      { q: "Do you plant trees or support reforestation?", options: ["Yes, actively", "Donated to campaigns", "Support the idea", "No"] },
    ],
  },
  {
    id: 13, name: "Entertainment & Media", questions: 7, payout: 68,
    questionList: [
      { q: "What type of music do you listen to most?", options: ["Gengetone/Kenyan", "Gospel", "Afrobeats", "International/Pop"] },
      { q: "How do you listen to music?", options: ["YouTube", "Spotify", "Boomplay", "Radio"] },
      { q: "How often do you watch TV?", options: ["Daily", "A few times a week", "Weekends only", "Rarely"] },
      { q: "Do you follow Kenyan sports?", options: ["Football (FKF)", "Athletics", "Rugby", "Not really"] },
      { q: "How much do you spend on entertainment monthly?", options: ["Under Ksh 1,000", "Ksh 1,000-3,000", "Ksh 3,000-5,000", "Over Ksh 5,000"] },
      { q: "Do you attend live events/concerts?", options: ["Frequently", "Occasionally", "Rarely", "Never"] },
      { q: "What Kenyan TV station do you watch most?", options: ["Citizen TV", "NTV", "KTN", "None/Streaming only"] },
    ],
  },
  {
    id: 14, name: "Airtel Kenya Services", questions: 6, payout: 52,
    questionList: [
      { q: "Do you use Airtel Kenya services?", options: ["Yes, primary line", "Yes, secondary line", "Previously used", "Never used"] },
      { q: "What Airtel service do you value most?", options: ["Affordable data bundles", "Airtel Money", "Call rates", "Network coverage"] },
      { q: "How would you rate Airtel's network in your area?", options: ["Excellent", "Good", "Fair", "Poor"] },
      { q: "Do you use Airtel Money?", options: ["Yes, daily", "Sometimes", "Rarely", "No"] },
      { q: "Would you switch fully to Airtel from Safaricom?", options: ["Already did", "Considering it", "Unlikely", "Never"] },
      { q: "What would make Airtel more attractive?", options: ["Better coverage", "Lower prices", "Better M-Money", "More promotions"] },
    ],
  },
  {
    id: 15, name: "Youth Employment Survey", questions: 8, payout: 100,
    questionList: [
      { q: "What is your current source of income?", options: ["Formal employment", "Hustling/Informal", "Business owner", "No income"] },
      { q: "How long have you been looking for work?", options: ["Not looking", "Under 6 months", "6-12 months", "Over 1 year"] },
      { q: "What sector do you work/want to work in?", options: ["Technology", "Agriculture", "Service industry", "Government"] },
      { q: "Do you have a side hustle?", options: ["Yes, it's my main income", "Yes, supplementary", "Planning one", "No"] },
      { q: "Have you applied for government youth funds?", options: ["Yes, received funding", "Applied, waiting", "Plan to apply", "No"] },
      { q: "What is your monthly income range?", options: ["Under Ksh 10,000", "Ksh 10,000-30,000", "Ksh 30,000-60,000", "Over Ksh 60,000"] },
      { q: "Do you think Kenya has enough job opportunities?", options: ["Yes", "Somewhat", "Not really", "Definitely not"] },
      { q: "What would help you earn more?", options: ["More education", "Startup capital", "Mentorship", "Better job market"] },
    ],
  },
  {
    id: 16, name: "Insurance Awareness", questions: 6, payout: 62,
    questionList: [
      { q: "What types of insurance do you have?", options: ["Health only", "Health + Life", "Motor vehicle", "None"] },
      { q: "Do you trust insurance companies in Kenya?", options: ["Yes", "Somewhat", "Not really", "Not at all"] },
      { q: "Why don't more Kenyans have insurance?", options: ["Too expensive", "Don't trust it", "Don't understand it", "Not a priority"] },
      { q: "Would you buy insurance via M-Pesa?", options: ["Yes, definitely", "Maybe", "Probably not", "No"] },
      { q: "Have you ever made an insurance claim?", options: ["Yes, smooth process", "Yes, difficult process", "Never needed to", "Don't have insurance"] },
      { q: "How much would you pay for insurance monthly?", options: ["Under Ksh 500", "Ksh 500-1,500", "Ksh 1,500-3,000", "Over Ksh 3,000"] },
    ],
  },
  {
    id: 17, name: "Real Estate & Housing", questions: 7, payout: 88,
    questionList: [
      { q: "Do you own or rent your home?", options: ["Own", "Rent", "Live with family", "Other"] },
      { q: "How much rent do you pay monthly?", options: ["Under Ksh 5,000", "Ksh 5,000-15,000", "Ksh 15,000-30,000", "Over Ksh 30,000"] },
      { q: "Are you saving to buy a home?", options: ["Yes, actively", "Planning to start", "Want to but can't", "Not interested"] },
      { q: "Which area would you prefer to live in?", options: ["Nairobi CBD area", "Nairobi suburbs", "Satellite towns", "Rural area"] },
      { q: "What matters most in choosing a home?", options: ["Price/Rent", "Location/Commute", "Security", "Size/Space"] },
      { q: "Do you know about KMRC affordable housing?", options: ["Yes, applied", "Know about it", "Heard of it", "No idea"] },
      { q: "Would you invest in real estate?", options: ["Already have", "Planning to", "Interested but no capital", "Not interested"] },
    ],
  },
  {
    id: 18, name: "Cybersecurity Awareness", questions: 6, payout: 75,
    questionList: [
      { q: "Have you been a victim of online fraud?", options: ["Yes, lost money", "Attempted but caught it", "Someone I know was", "Never"] },
      { q: "Do you use the same password for multiple accounts?", options: ["Yes, all accounts", "A few accounts", "Rarely", "Never, all unique"] },
      { q: "Do you use two-factor authentication?", options: ["Yes, always", "On important accounts", "Heard of it but don't use", "Don't know what it is"] },
      { q: "How do you handle suspicious messages/calls?", options: ["Ignore/block", "Report to provider", "Check if legitimate first", "Sometimes fall for them"] },
      { q: "Do you know how to identify a phishing link?", options: ["Yes, confidently", "Somewhat", "Not really", "No idea"] },
      { q: "Would you attend a cybersecurity training?", options: ["Definitely", "If free", "Maybe", "Not interested"] },
    ],
  },
  {
    id: 19, name: "Betting & Gaming Kenya", questions: 7, payout: 82,
    questionList: [
      { q: "Do you participate in sports betting?", options: ["Yes, regularly", "Occasionally", "Used to", "Never"] },
      { q: "Which betting platform do you use?", options: ["Sportpesa", "Betika", "1xBet", "None/Other"] },
      { q: "How much do you spend on betting weekly?", options: ["Under Ksh 500", "Ksh 500-2,000", "Ksh 2,000-5,000", "Over Ksh 5,000"] },
      { q: "Do you think betting regulations are sufficient?", options: ["Yes", "Need more regulation", "Too much regulation", "Don't know"] },
      { q: "Has betting affected your finances negatively?", options: ["Yes, significantly", "Somewhat", "Not really", "I don't bet"] },
      { q: "Do you think betting ads should be restricted?", options: ["Yes, completely", "Partially", "No, they're fine", "Don't care"] },
      { q: "What would you do with a big win?", options: ["Invest/Save", "Pay debts", "Buy property", "Spend on lifestyle"] },
    ],
  },
  {
    id: 20, name: "Water & Sanitation", questions: 6, payout: 55,
    questionList: [
      { q: "What is your primary water source?", options: ["County water supply", "Borehole", "Water vendor", "Rainwater harvesting"] },
      { q: "How reliable is your water supply?", options: ["Always available", "Most days", "A few days a week", "Very unreliable"] },
      { q: "Do you treat/purify your drinking water?", options: ["Always boil", "Use water guard", "Buy bottled water", "Drink directly"] },
      { q: "How much do you spend on water monthly?", options: ["Under Ksh 500", "Ksh 500-1,500", "Ksh 1,500-3,000", "Over Ksh 3,000"] },
      { q: "Do you have a flush toilet at home?", options: ["Yes", "Pit latrine", "Shared facilities", "Other"] },
      { q: "Would you pay for improved sanitation services?", options: ["Yes", "Depends on cost", "Probably not", "No"] },
    ],
  },
  {
    id: 21, name: "Kenyan Politics & Governance", questions: 7, payout: 92,
    questionList: [
      { q: "Did you vote in the last general election?", options: ["Yes", "No, wasn't registered", "No, chose not to", "Was underage"] },
      { q: "How satisfied are you with your county government?", options: ["Very satisfied", "Somewhat satisfied", "Dissatisfied", "Very dissatisfied"] },
      { q: "What is the biggest governance issue in Kenya?", options: ["Corruption", "Unemployment", "Healthcare", "Education"] },
      { q: "Do you trust the IEBC?", options: ["Yes, fully", "Somewhat", "Not really", "Not at all"] },
      { q: "How do you get political news?", options: ["TV", "Social media", "Radio", "Newspapers"] },
      { q: "Do you think devolution has worked?", options: ["Yes, very well", "Somewhat", "Not really", "Failed completely"] },
      { q: "Would you consider running for office?", options: ["Yes", "Maybe someday", "Unlikely", "Never"] },
    ],
  },
  {
    id: 22, name: "Kenyan Tourism Insights", questions: 8, payout: 105,
    questionList: [
      { q: "Have you visited a national park/reserve?", options: ["Yes, multiple", "Once or twice", "Plan to", "Never"] },
      { q: "Which tourist destination would you visit?", options: ["Maasai Mara", "Diani Beach", "Mount Kenya", "Lamu Island"] },
      { q: "How much would you spend on a local holiday?", options: ["Under Ksh 10,000", "Ksh 10,000-30,000", "Ksh 30,000-50,000", "Over Ksh 50,000"] },
      { q: "Do you think domestic tourism is affordable?", options: ["Yes", "Somewhat", "Too expensive", "Never thought about it"] },
      { q: "What stops you from travelling more?", options: ["Money", "Time off work", "Family obligations", "Nothing, I travel often"] },
      { q: "Have you used any travel booking apps?", options: ["Yes, frequently", "A few times", "Once", "Never"] },
      { q: "Would you host tourists via Airbnb?", options: ["Already do", "Considering it", "Maybe", "No"] },
      { q: "What type of holiday do you prefer?", options: ["Beach", "Safari", "City break", "Adventure/Hiking"] },
    ],
  },
  {
    id: 23, name: "Freelancing & Gig Economy", questions: 7, payout: 88,
    questionList: [
      { q: "Do you do freelance or gig work?", options: ["Yes, full-time", "Yes, part-time", "Occasionally", "No"] },
      { q: "What type of freelance work do you do?", options: ["Writing/Content", "Design/Creative", "Tech/Development", "Driving/Delivery"] },
      { q: "Which platform do you use for gigs?", options: ["Upwork/Fiverr", "WhatsApp groups", "Social media", "Local networks"] },
      { q: "How much do you earn monthly from gigs?", options: ["Under Ksh 5,000", "Ksh 5,000-20,000", "Ksh 20,000-50,000", "Over Ksh 50,000"] },
      { q: "What's the biggest challenge in freelancing?", options: ["Finding clients", "Late payments", "Inconsistent income", "No benefits/insurance"] },
      { q: "Do you pay taxes on gig income?", options: ["Yes, always", "Sometimes", "Don't know how", "No"] },
      { q: "Would you prefer a formal job over freelancing?", options: ["Yes, definitely", "Depends on the job", "No, I prefer freedom", "Already have both"] },
    ],
  },
  {
    id: 24, name: "Parenting in Kenya", questions: 8, payout: 98,
    questionList: [
      { q: "How many children do you have?", options: ["None", "1-2", "3-4", "5+"] },
      { q: "What type of school do your children attend?", options: ["Public", "Private", "Homeschool", "N/A"] },
      { q: "How much do you spend on school fees per term?", options: ["Under Ksh 10,000", "Ksh 10,000-30,000", "Ksh 30,000-80,000", "Over Ksh 80,000"] },
      { q: "What is your biggest parenting challenge?", options: ["School fees", "Screen time", "Discipline", "Work-life balance"] },
      { q: "Do your children use smartphones?", options: ["Yes, their own", "Yes, shared device", "Limited access", "No"] },
      { q: "How do you monitor your children online?", options: ["Parental controls", "Check their phone", "Talk to them about it", "Don't monitor"] },
      { q: "Do you save for your children's future?", options: ["Yes, education fund", "Yes, general savings", "Want to but can't", "No"] },
      { q: "What extracurricular activities for your kids?", options: ["Sports", "Music/Art", "Academic tutoring", "None"] },
    ],
  },
  {
    id: 25, name: "E-commerce & Digital Trade", questions: 7, payout: 78,
    questionList: [
      { q: "Do you sell anything online?", options: ["Yes, full-time business", "Yes, side hustle", "Planning to start", "No"] },
      { q: "Which platform do you sell on?", options: ["Instagram/Facebook", "Jumia/Kilimall", "Own website", "WhatsApp"] },
      { q: "What do you sell?", options: ["Fashion/Clothing", "Food/Beverages", "Electronics", "Services"] },
      { q: "How do you handle deliveries?", options: ["Personal delivery", "Courier services", "Pick-up points", "Digital products only"] },
      { q: "What's your biggest challenge selling online?", options: ["Getting customers", "Competition", "Delivery logistics", "Trust issues"] },
      { q: "Do you advertise your business online?", options: ["Yes, paid ads", "Organic posts only", "Word of mouth", "No marketing"] },
      { q: "Monthly revenue from online sales?", options: ["Under Ksh 10,000", "Ksh 10,000-50,000", "Ksh 50,000-200,000", "Over Ksh 200,000"] },
    ],
  },
  {
    id: 26, name: "Kenyan Music & Culture", questions: 6, payout: 60,
    questionList: [
      { q: "What Kenyan music genre do you enjoy most?", options: ["Gengetone", "Benga", "Gospel", "Afro-pop"] },
      { q: "Do you support local artists by buying music?", options: ["Yes, streaming", "Buy merchandise", "Attend concerts", "No"] },
      { q: "Which Kenyan cultural festival have you attended?", options: ["Lamu Festival", "Turkana Festival", "Blankets & Wine", "None"] },
      { q: "Do you speak your mother tongue fluently?", options: ["Yes", "Somewhat", "A few words", "No"] },
      { q: "How important is preserving Kenyan culture?", options: ["Very important", "Important", "Somewhat", "Not important"] },
      { q: "Do you consume Kenyan-made movies/series?", options: ["Yes, regularly", "Sometimes", "Rarely", "Never"] },
    ],
  },
  {
    id: 27, name: "Renewable Energy Adoption", questions: 7, payout: 85,
    questionList: [
      { q: "Do you use solar energy at home?", options: ["Yes, full solar", "Solar + grid", "Plan to install", "No"] },
      { q: "What is your monthly electricity bill?", options: ["Under Ksh 1,000", "Ksh 1,000-3,000", "Ksh 3,000-5,000", "Over Ksh 5,000"] },
      { q: "How often do you experience power outages?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { q: "Would you invest in a home solar system?", options: ["Already have", "Yes, if affordable", "Maybe", "No"] },
      { q: "Do you use energy-saving bulbs?", options: ["Yes, all bulbs", "Most bulbs", "A few", "No"] },
      { q: "How do you charge your phone when power is out?", options: ["Solar charger", "Power bank", "Go elsewhere", "Wait for power"] },
      { q: "Do you know about KPLC prepaid meters?", options: ["Yes, I use one", "Know about it", "Heard of it", "No"] },
    ],
  },
  {
    id: 28, name: "Pet Ownership in Kenya", questions: 6, payout: 52,
    questionList: [
      { q: "Do you own a pet?", options: ["Yes, dog", "Yes, cat", "Yes, other", "No"] },
      { q: "How much do you spend on your pet monthly?", options: ["Under Ksh 1,000", "Ksh 1,000-3,000", "Ksh 3,000-5,000", "Don't have a pet"] },
      { q: "Do you take your pet to a vet regularly?", options: ["Yes, annually", "When sick only", "Rarely", "N/A"] },
      { q: "Where did you get your pet?", options: ["Adopted/rescued", "Bought from breeder", "Gift", "Stray that stayed"] },
      { q: "Would you buy pet insurance?", options: ["Yes", "Maybe", "Probably not", "No"] },
      { q: "Do you think Kenya needs more animal shelters?", options: ["Definitely", "Probably", "Not sure", "No"] },
    ],
  },
  {
    id: 29, name: "Matatu Industry Survey", questions: 7, payout: 72,
    questionList: [
      { q: "How often do you use matatus?", options: ["Daily", "A few times a week", "Occasionally", "Never"] },
      { q: "What route do you use most?", options: ["CBD to estates", "Long distance", "Within town", "Rural routes"] },
      { q: "How much do you spend on matatu fare daily?", options: ["Under Ksh 100", "Ksh 100-200", "Ksh 200-400", "Over Ksh 400"] },
      { q: "What frustrates you most about matatus?", options: ["Reckless driving", "Overcharging", "Loud music", "Overcrowding"] },
      { q: "Do you use cashless matatu payment?", options: ["Yes, always", "Sometimes", "Rarely", "Cash only"] },
      { q: "Should matatus be replaced by buses?", options: ["Yes, completely", "Partially", "No, improve matatus", "Don't care"] },
      { q: "Do you feel safe in matatus?", options: ["Always", "Usually", "Sometimes", "Never"] },
    ],
  },
  {
    id: 30, name: "Mental Health Awareness", questions: 8, payout: 115,
    questionList: [
      { q: "How would you describe your stress levels?", options: ["Very low", "Manageable", "High", "Overwhelming"] },
      { q: "Have you ever sought professional mental health help?", options: ["Yes, currently", "Yes, in the past", "Considered it", "Never"] },
      { q: "What is your biggest source of stress?", options: ["Finances", "Work/Career", "Relationships", "Health"] },
      { q: "Do you think mental health stigma exists in Kenya?", options: ["Yes, very much", "Somewhat", "It's improving", "Not really"] },
      { q: "How do you cope with stress?", options: ["Exercise", "Talking to someone", "Prayer/Meditation", "Social media/Entertainment"] },
      { q: "Would you use a mental health app?", options: ["Yes, definitely", "Maybe", "Probably not", "No"] },
      { q: "Can you afford therapy sessions?", options: ["Yes", "If subsidized", "Too expensive", "Don't believe in therapy"] },
      { q: "Should employers provide mental health support?", options: ["Yes, mandatory", "Yes, optional", "Not their responsibility", "Don't know"] },
    ],
  },
];

const packageLimits: Record<string, { surveys: number; minWithdraw: number; name: string }> = {
  free: { surveys: 1, minWithdraw: 0, name: "Free Account" },
  basic: { surveys: 10, minWithdraw: 3000, name: "Business Basic" },
  premium: { surveys: 15, minWithdraw: 2500, name: "Business Premium" },
  expert: { surveys: 20, minWithdraw: 2000, name: "Business Expert" },
  platinum: { surveys: 40, minWithdraw: 1000, name: "PLATINUM" },
  diamond: { surveys: 60, minWithdraw: 500, name: "DIAMOND" },
  elite: { surveys: 80, minWithdraw: 200, name: "ELITE" },
};

const SurveyModal = ({ survey, onClose, onComplete }: { survey: typeof surveys[0]; onClose: () => void; onComplete: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const questions = survey.questionList;

  const handleAnswer = (opt: string) => {
    const newAnswers = [...answers, opt];
    setAnswers(newAnswers);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
      onComplete();
    }
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-card">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <h2 className="font-display text-2xl font-bold text-primary">Survey Complete!</h2>
          <p className="text-muted-foreground">You earned <span className="text-primary font-bold">Ksh {survey.payout}</span></p>
          <Button onClick={onClose} className="gradient-green text-primary-foreground">Back to Surveys</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl p-5 sm:p-6 w-[calc(100%-2rem)] max-w-lg shadow-card mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-base sm:text-lg font-bold text-primary truncate pr-2">{survey.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl shrink-0">&times;</button>
        </div>
        <div className="mb-2 text-xs text-muted-foreground">Question {current + 1} of {questions.length}</div>
        <div className="w-full bg-secondary rounded-full h-2 mb-4">
          <div className="gradient-green h-2 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <p className="text-foreground mb-4 font-medium text-sm sm:text-base">{questions[current].q}</p>
        <div className="space-y-2">
          {questions[current].options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="w-full text-left p-3 rounded-lg border border-border bg-secondary/50 hover:bg-primary/20 hover:border-primary transition-colors text-foreground text-sm sm:text-base"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const UpgradeModal = ({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-card">
      <Lock className="h-16 w-16 text-primary mx-auto" />
      <h2 className="font-display text-2xl font-bold text-primary">Survey Limit Reached</h2>
      <p className="text-muted-foreground">Free accounts can only complete <span className="text-primary font-bold">1 survey per day</span>. Upgrade your account to unlock more surveys and earn more!</p>
      <div className="flex flex-col gap-2">
        <Button onClick={onUpgrade} className="gradient-green text-primary-foreground font-semibold">
          Upgrade Now
        </Button>
        <Button onClick={onClose} variant="outline" className="border-primary text-primary">
          Maybe Later
        </Button>
      </div>
    </div>
  </div>
);

const fakeEarners = [
  { name: "James", phone: "0712***890", location: "Nairobi", amount: 1250 },
  { name: "Mary", phone: "0798***234", location: "Mombasa", amount: 1800 },
  { name: "David", phone: "0723***567", location: "Kisumu", amount: 1500 },
  { name: "Sarah", phone: "0745***112", location: "Eldoret", amount: 2100 },
  { name: "Michael", phone: "0701***445", location: "Nakuru", amount: 1350 },
  { name: "Grace", phone: "0733***678", location: "Thika", amount: 1600 },
  { name: "Peter", phone: "0756***321", location: "Nyeri", amount: 1150 },
  { name: "Ann", phone: "0710***889", location: "Machakos", amount: 1900 },
  { name: "Kevin", phone: "0769***102", location: "Naivasha", amount: 1450 },
  { name: "Lucy", phone: "0741***556", location: "Kisii", amount: 1750 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, account, refreshAccount } = useAuth();
  const [activeSurvey, setActiveSurvey] = useState<typeof surveys[0] | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [surveysCompletedToday, setSurveysCompletedToday] = useState(0);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; name: string; phone: string; location: string; amount: number }[]>([]);

  // Ensure user_account record exists (create if missing)
  useEffect(() => {
    const ensureAccount = async () => {
      if (user && !account) {
        await supabase.from("user_accounts").upsert({
          user_id: user.id,
          phone_number: user.id,
          account_type: "free",
          surveys_per_day: 1,
          min_withdrawal: 0,
          balance: 0,
        }, { onConflict: "user_id" });
        await refreshAccount();
      }
    };
    ensureAccount();
  }, [user, account]);

  // Sync surveys completed today from account data
  useEffect(() => {
    if (account) {
      const today = new Date().toISOString().split("T")[0];
      if (account.last_survey_date === today) {
        setSurveysCompletedToday(account.surveys_completed_today);
      } else {
        setSurveysCompletedToday(0);
      }
    }
  }, [account]);

  const accountType = account?.account_type || "free";
  const balance = account?.balance || 0;
  const pkg = packageLimits[accountType] || packageLimits.free;

  const handleTakeSurvey = (survey: typeof surveys[0]) => {
    if (!account) {
      // No account record yet, block surveys
      setShowUpgradeModal(true);
      return;
    }
    const limit = account.surveys_per_day || 1;
    if (surveysCompletedToday >= limit) {
      setShowUpgradeModal(true);
      return;
    }
    setActiveSurvey(survey);
  };

  const handleSurveyComplete = async () => {
    if (!user || !account || !activeSurvey) return;
    const newCount = surveysCompletedToday + 1;
    setSurveysCompletedToday(newCount);
    setCompletedSurveyIds(prev => [...prev, activeSurvey.id]);

    const today = new Date().toISOString().split("T")[0];
    const newBalance = balance + activeSurvey.payout;

    await supabase.from("user_accounts").update({
      surveys_completed_today: newCount,
      last_survey_date: today,
      balance: newBalance,
    }).eq("user_id", user.id);

    await refreshAccount();
  };

  const canWithdraw = accountType !== "free" && balance >= pkg.minWithdraw;
  const availableSurveys = surveys.filter(s => !completedSurveyIds.includes(s.id));

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      {/* Fake earnings notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[220px]">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="animate-slide-in-right bg-card border border-border rounded-lg px-3 py-2 shadow-card"
          >
            <p className="text-xs text-foreground">
              <span className="font-bold text-primary">{n.name}</span> ({n.phone}) just withdrew{" "}
              <span className="font-bold text-primary">Ksh {n.amount}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Balance Card */}
      <div className="container mx-auto px-4 mt-6">
        <div className="rounded-xl bg-card border border-border p-6 shadow-card">
          <div className="text-center mb-4">
            <h2 className="font-display text-xl font-bold text-primary">Total Balance</h2>
            <p className="text-2xl font-bold text-foreground">Ksh {balance.toLocaleString()}</p>
            <span className="inline-block mt-1 gradient-green text-primary-foreground px-3 py-0.5 rounded-full text-xs font-bold">
              {pkg.name}
            </span>
          </div>
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" /> Your Balance: <span className="text-foreground font-bold">Ksh {balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" /> Loyalty Points: <span className="text-foreground font-bold">0</span>
              </div>
              {accountType !== "free" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="h-4 w-4" /> Min withdraw: <span className="text-foreground font-bold">Ksh {pkg.minWithdraw.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setShowWithdrawDialog(true)} className="gradient-green text-primary-foreground gap-2">
                <Banknote className="h-4 w-4" /> Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys */}
      <div className="container mx-auto px-4 mt-6 pb-8">
        <div className="rounded-xl bg-card border border-border p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Surveys For You Today</h2>
          <div className="gradient-green rounded-lg p-3 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-foreground" />
            <span className="text-sm text-primary-foreground font-medium">
              {accountType === "free"
                ? "Free account — 1 survey per day. Upgrade to unlock more!"
                : `${pkg.name} — ${pkg.surveys} surveys per day`}
            </span>
          </div>

          <div className="space-y-3">
            {availableSurveys.map((s) => (
              <div key={s.id} className="rounded-lg border border-border bg-secondary/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-primary truncate">{s.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> Questions: <span className="text-primary font-semibold">{s.questions}</span></span>
                    <span className="flex items-center gap-1">
                      <Banknote className="h-3.5 w-3.5" /> Payout:
                      <span className="gradient-green text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">Ksh {s.payout}</span>
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleTakeSurvey(s)}
                  className="gradient-green text-primary-foreground font-semibold shrink-0 w-full sm:w-auto"
                >
                  Take Survey
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeSurvey && (
        <SurveyModal
          survey={activeSurvey}
          onClose={() => setActiveSurvey(null)}
          onComplete={handleSurveyComplete}
        />
      )}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => { setShowUpgradeModal(false); navigate("/upgrade"); }}
        />
      )}

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
      <DialogContent className="bg-card border-border w-[calc(100%-2rem)] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {accountType === "free" ? (
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-accent mx-auto" />
                <h3 className="font-display text-lg font-bold text-foreground">Free Account</h3>
                <p className="text-muted-foreground">
                  Free accounts cannot withdraw. Please <span className="text-primary font-bold">upgrade your account</span> to enable withdrawals.
                </p>
                <Button onClick={() => { setShowWithdrawDialog(false); navigate("/upgrade"); }} className="gradient-green text-primary-foreground font-semibold w-full">
                  <ArrowUpCircle className="h-4 w-4 mr-2" /> Upgrade Account
                </Button>
              </div>
            ) : !canWithdraw ? (
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-accent mx-auto" />
                <h3 className="font-display text-lg font-bold text-foreground">Insufficient Balance</h3>
                <p className="text-muted-foreground">
                  Your current balance is <span className="text-primary font-bold">Ksh {balance.toLocaleString()}</span>.
                  The minimum withdrawal for your <span className="text-primary font-bold">{pkg.name}</span> account is
                  <span className="text-primary font-bold"> Ksh {pkg.minWithdraw.toLocaleString()}</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                  You need <span className="text-primary font-bold">Ksh {(pkg.minWithdraw - balance).toLocaleString()}</span> more to withdraw.
                </p>
                <Button onClick={() => setShowWithdrawDialog(false)} variant="outline" className="border-primary text-primary w-full">
                  Keep Earning
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                <h3 className="font-display text-lg font-bold text-foreground">Ready to Withdraw!</h3>
                <p className="text-muted-foreground">
                  Your balance of <span className="text-primary font-bold">Ksh {balance.toLocaleString()}</span> is eligible for withdrawal.
                </p>
                <div className="gradient-green rounded-lg p-3">
                  <p className="text-primary-foreground text-sm font-medium">
                    Funds will be sent to your registered M-Pesa number. Make sure your payment details are up to date in your profile.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => { setShowWithdrawDialog(false); navigate("/profile"); }} className="gradient-green text-primary-foreground font-semibold">
                    Confirm Payment Details & Withdraw
                  </Button>
                  <Button onClick={() => setShowWithdrawDialog(false)} variant="outline" className="border-primary text-primary">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
