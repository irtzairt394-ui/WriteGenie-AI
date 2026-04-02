"""
WriteGenie AI — Premium AI Writing Tools Platform
Backend Server (Flask + Google Gemini API)
"""
import os
import json
import datetime
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from google import genai

# ============================================================
# CONFIGURATION
# ============================================================
API_KEY = "AIzaSyARSLVSpY5JNjoIdubzY7L1umGqHcZTG44"
client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.5-flash"

app = Flask(__name__)
CORS(app)

# Track usage for analytics
USAGE_LOG = os.path.join(os.path.dirname(__file__), "usage_log.json")

def log_usage(tool_name, word_count):
    """Log each generation for analytics."""
    entry = {
        "tool": tool_name,
        "words": word_count,
        "timestamp": datetime.datetime.now().isoformat()
    }
    try:
        if os.path.exists(USAGE_LOG):
            with open(USAGE_LOG, "r") as f:
                data = json.load(f)
        else:
            data = []
        data.append(entry)
        with open(USAGE_LOG, "w") as f:
            json.dump(data, f, indent=2)
    except:
        pass

def get_usage_stats():
    """Get usage statistics."""
    try:
        if os.path.exists(USAGE_LOG):
            with open(USAGE_LOG, "r") as f:
                data = json.load(f)
            total_generations = len(data)
            total_words = sum(d.get("words", 0) for d in data)
            tool_counts = {}
            for d in data:
                t = d.get("tool", "unknown")
                tool_counts[t] = tool_counts.get(t, 0) + 1
            return {
                "total_generations": total_generations,
                "total_words": total_words,
                "tool_breakdown": tool_counts
            }
    except:
        pass
    return {"total_generations": 0, "total_words": 0, "tool_breakdown": {}}


def call_gemini(prompt):
    """Call Gemini API and return the generated text."""
    try:
        response = client.models.generate_content(model=MODEL, contents=prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"


# ============================================================
# ROUTES
# ============================================================
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/stats")
def stats():
    return jsonify(get_usage_stats())


@app.route("/api/generate/email", methods=["POST"])
def generate_email():
    data = request.json
    recipient = data.get("recipient", "a potential client")
    purpose = data.get("purpose", "business introduction")
    tone = data.get("tone", "professional")
    details = data.get("details", "")

    prompt = f"""You are a world-class business email copywriter. Write a compelling {tone} email.

Recipient/Company: {recipient}
Purpose: {purpose}
Additional Context: {details}

Requirements:
- Write a complete email with Subject Line, Greeting, Body, and Sign-off
- Make it persuasive but not pushy
- Keep it concise (under 200 words for the body)
- Use psychological triggers (scarcity, social proof, authority)
- Make the subject line attention-grabbing
- Include a clear call-to-action

Format the output as:
SUBJECT: [subject line]

[email body]"""

    result = call_gemini(prompt)
    word_count = len(result.split())
    log_usage("email_writer", word_count)
    return jsonify({"result": result, "words": word_count})


@app.route("/api/generate/social", methods=["POST"])
def generate_social():
    data = request.json
    platform = data.get("platform", "LinkedIn")
    topic = data.get("topic", "business growth")
    tone = data.get("tone", "professional")
    details = data.get("details", "")

    prompt = f"""You are a viral social media content strategist. Create an engaging {platform} post.

Topic: {topic}
Tone: {tone}
Additional Context: {details}

Requirements for {platform}:
- Hook the reader in the first line (pattern interrupt)
- Use short paragraphs and line breaks for readability
- Include relevant emojis (but not excessive)
- Add 3-5 targeted hashtags at the end
- Include a conversation-starting question at the end
- Optimize for the {platform} algorithm (engagement-focused)
- Keep it authentic and value-driven
- Length: 150-250 words"""

    result = call_gemini(prompt)
    word_count = len(result.split())
    log_usage("social_post", word_count)
    return jsonify({"result": result, "words": word_count})


@app.route("/api/generate/product", methods=["POST"])
def generate_product():
    data = request.json
    product_name = data.get("product_name", "Product")
    category = data.get("category", "general")
    features = data.get("features", "")
    target_audience = data.get("target_audience", "general consumers")

    prompt = f"""You are an expert e-commerce copywriter who has written for Amazon, Shopify, and major brands. Write a premium product description.

Product: {product_name}
Category: {category}
Key Features: {features}
Target Audience: {target_audience}

Requirements:
- Write a compelling headline (benefit-focused)
- Write 2-3 paragraphs of persuasive description
- List 5 key features as bullet points with benefit explanations
- Include sensory language and emotional triggers
- Add a compelling call-to-action
- Optimize for SEO with natural keyword placement
- Make it feel premium and aspirational"""

    result = call_gemini(prompt)
    word_count = len(result.split())
    log_usage("product_description", word_count)
    return jsonify({"result": result, "words": word_count})


@app.route("/api/generate/blog", methods=["POST"])
def generate_blog():
    data = request.json
    title = data.get("title", "")
    niche = data.get("niche", "business")
    keywords = data.get("keywords", "")
    length = data.get("length", "medium")

    length_map = {"short": "500-700", "medium": "800-1200", "long": "1500-2000"}
    word_range = length_map.get(length, "800-1200")

    prompt = f"""You are a top-tier SEO content writer and blogger. Write a high-quality blog post.

Title/Topic: {title}
Niche: {niche}
Target Keywords: {keywords}
Target Length: {word_range} words

Requirements:
- Write an attention-grabbing introduction with a hook
- Use H2 and H3 subheadings for structure
- Include actionable tips and real-world examples
- Write in a conversational yet authoritative tone
- Optimize for SEO naturally (don't keyword stuff)
- Include a compelling conclusion with a call-to-action
- Add internal linking suggestions in [brackets]
- Make it genuinely useful and informative"""

    result = call_gemini(prompt)
    word_count = len(result.split())
    log_usage("blog_post", word_count)
    return jsonify({"result": result, "words": word_count})


@app.route("/api/generate/ad", methods=["POST"])
def generate_ad():
    data = request.json
    product_service = data.get("product_service", "")
    platform = data.get("platform", "Facebook/Instagram")
    objective = data.get("objective", "conversions")
    target_audience = data.get("target_audience", "")
    budget_range = data.get("budget_range", "medium")

    prompt = f"""You are a performance marketing expert who has managed millions in ad spend. Create high-converting ad copy.

Product/Service: {product_service}
Ad Platform: {platform}
Campaign Objective: {objective}
Target Audience: {target_audience}

Requirements:
- Create 3 different ad variations (for A/B testing)
- Each ad should have: Headline, Primary Text, Description, and CTA button text
- Use proven copywriting frameworks (AIDA, PAS, or BAB)
- Include power words and emotional triggers
- Keep headlines under 40 characters
- Keep primary text under 125 characters for optimal display
- Make each variation have a different angle/hook
- Label them as: Ad Variation A, Ad Variation B, Ad Variation C"""

    result = call_gemini(prompt)
    word_count = len(result.split())
    log_usage("ad_copy", word_count)
    return jsonify({"result": result, "words": word_count})


@app.route("/api/generate/rewrite", methods=["POST"])
def rewrite_content():
    data = request.json
    original_text = data.get("original_text", "")
    style = data.get("style", "professional")
    instruction = data.get("instruction", "improve and enhance")

    prompt = f"""You are an expert editor and content strategist. Rewrite and improve the following text.

Original Text:
{original_text}

Rewrite Style: {style}
Special Instructions: {instruction}

Requirements:
- Maintain the core message but dramatically improve quality
- Fix any grammar, spelling, or punctuation issues
- Improve clarity, flow, and readability
- Make it more engaging and compelling
- Adjust tone to match the requested style
- Provide the rewritten version only (no explanations)"""

    result = call_gemini(prompt)
    word_count = len(result.split())
    log_usage("content_rewriter", word_count)
    return jsonify({"result": result, "words": word_count})


# ============================================================
# START SERVER
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=False)
