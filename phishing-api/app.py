from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re

app = Flask(__name__)

# Load model and tokenizer once
tokenizer = AutoTokenizer.from_pretrained("cybersectony/phishing-email-detection-distilbert_v2.4.1")
model = AutoModelForSequenceClassification.from_pretrained("cybersectony/phishing-email-detection-distilbert_v2.4.1")

# Check email domain
def check_email_address(email):
    suspicious_keywords = ['mail.ru', 'xyz', 'support123', 'loginverify']
    match = re.search(r"@([a-zA-Z0-9.-]+)", email)
    if not match:
        return "Invalid format"
    domain = match.group(1)
    if any(keyword in domain for keyword in suspicious_keywords):
        return f"⚠️ Suspicious domain: {domain}"
    elif not domain.endswith(('.com', '.org', '.edu', '.gov')):
        return f"⚠️ Uncommon domain: {domain}"
    else:
        return f"✅ Domain looks fine: {domain}"

# Predict phishing
def predict_email_body(email_body):
    inputs = tokenizer(email_body, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)

    probs = predictions[0].tolist()
    labels = {
        "legitimate_email": probs[0],
        "phishing_url": probs[1],
        "legitimate_url": probs[2],
        "phishing_url_alt": probs[3]
    }

    max_label = max(labels.items(), key=lambda x: x[1])
    return {
        "prediction": max_label[0],
        "confidence": round(max_label[1], 4),
        "all_probabilities": labels
    }

# API route
@app.route('/api/predict', methods=['POST'])
def analyze_email():
    data = request.get_json()
    email = data.get('email')
    body = data.get('body')

    if not email or not body:
        return jsonify({"error": "Email and body are required"}), 400

    email_result = check_email_address(email)
    body_result = predict_email_body(body)

    return jsonify({
        "email_check": email_result,
        "prediction": body_result['prediction'],
        "confidence": body_result['confidence'],
        "all_probabilities": body_result['all_probabilities']
    })

if __name__ == '__main__':
    app.run(debug=True)
