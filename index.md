---
layout: default
title: Home
description: Welcome to Math Practice
permalink: /
---

<div class="home-container">
    <!-- Hero Section -->
    <div class="hero-section">
        <h1 class="hero-title">Math Practice</h1>
        <p class="hero-description">Master your math skills with interactive practice problems!</p>
    </div>

    <!-- Operation Cards -->
    <div class="operation-cards">
        {% for operation in site.math_operations %}
        <a href="{{ operation.path | relative_url }}" class="operation-card">
            <div class="card-content">
                {% case operation.name %}
                    {% when 'Addition' %}
                        <div class="card-icon">+</div>
                        <h3 class="card-title">Addition</h3>
                        <p class="card-description">Practice adding numbers together</p>
                        <div class="card-example">12 + 7 = 19</div>
                    {% when 'Subtraction' %}
                        <div class="card-icon">−</div>
                        <h3 class="card-title">Subtraction</h3>
                        <p class="practice">Practice subtracting numbers</p>
                        <div class="card-example">15 - 8 = 7</div>
                    {% when 'Multiplication' %}
                        <div class="card-icon">×</div>
                        <h3 class="card-title">Multiplication</h3>
                        <p class="card-description">Practice multiplying numbers</p>
                        <div class="card-example">6 × 9 = 54</div>
                    {% when 'Division' %}
                        <div class="card-icon">÷</div>
                        <h3 class="card-title">Division</h3>
                        <p class="card-description">Practice dividing numbers</p>
                        <div class="card-example">56 ÷ 7 = 8</div>
                {% endcase %}
            </div>
            <div class="card-action">Start Practicing →</div>
        </a>
        {% endfor %}
    </div>

    <!-- Features Section -->
    <div class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
            <div class="feature">
                <div class="feature-icon">📊</div>
                <h3>Track Progress</h3>
                <p>Monitor your accuracy and improvement over time</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Instant Feedback</h3>
                <p>Get immediate results on your answers</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🔄</div>
                <h3>Unlimited Problems</h3>
                <p>Generate new problems with a single click</p>
            </div>
            <div class="feature">
                <div class="feature-icon">💾</div>
                <h3>Save Progress</h3>
                <p>Your scores are saved locally in your browser</p>
            </div>
        </div>
    </div>
</div>
