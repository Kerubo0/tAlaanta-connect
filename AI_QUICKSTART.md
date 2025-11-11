# 🤖 Quick Start Guide - AI Features

## Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

## Step 2: Add API Key to Environment

Edit `/home/subchief/taalanta/talentbridge/.env`:

```env
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

## Step 3: Restart Dev Server

```bash
npm run dev
```

## Step 4: Test the Features

### Test the Chatbot
1. Look for floating chat button (bottom-right)
2. Click to open
3. Try asking: "How do I connect my wallet?"
4. See AI respond!

### Test Proposal Assistant
1. Go to a job detail page
2. Find the "AI Proposal Assistant" card
3. Write a draft proposal
4. Click "Enhance with AI"
5. See improved version!

### Test Job Matching
1. Go to "Find Work" page
2. See AI match scores on job cards
3. Click a job to see detailed match analysis
4. View skill matches and gaps

## 🎯 What Each Feature Does

### 🎯 AI Job Matching
- **What**: Scores how well you match each job
- **Where**: Jobs page, job details
- **Benefit**: Find best-fit opportunities quickly

### ✍️ Proposal Assistant  
- **What**: Improves your job proposals
- **Where**: Job application form
- **Benefit**: Win more contracts

### 💬 Smart Chatbot
- **What**: Answers your questions 24/7
- **Where**: Every page (floating button)
- **Benefit**: Get help instantly

## 💡 Pro Tips

1. **Chatbot**: Ask about wallet setup, fees, escrow
2. **Proposals**: Write a draft first, then enhance
3. **Job Match**: Focus on 70%+ matches
4. **API Costs**: Each AI call costs ~$0.001-0.002

## 🔧 Troubleshooting

### Chatbot not responding?
- Check API key in `.env`
- Restart dev server
- Check browser console for errors

### "API not configured" message?
- API key not set correctly
- Falls back to basic features

### Slow responses?
- Normal! AI takes 2-5 seconds
- Shows loading spinner

## 🚀 Next Steps

1. **Customize Prompts**: Edit `/lib/ai.ts`
2. **Add More Features**: Use the AI service
3. **Production**: Move API calls to backend

## 📊 Cost Estimate

Typical usage costs:
- Job match: ~$0.001 per calculation
- Proposal enhancement: ~$0.002 per enhancement
- Chatbot message: ~$0.001 per message

Monthly estimate for 100 users: ~$20-50

## ⚠️ Important Notes

- **Development Only**: Current setup is for development
- **Production**: Must route through backend server
- **Security**: Never commit API keys to git
- **Costs**: Monitor OpenAI dashboard for usage

---

**You're all set! Start using AI to supercharge your freelancing platform! 🎉**
