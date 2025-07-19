# PCI DSS v4.0.1 Requirements 6.4.3 and 11.6.1 Analysis

## Introduction
This document summarizes the key aspects of PCI DSS v4.0.1 Requirements 6.4.3 and 11.6.1, focusing on their intent, applicability, and recommended controls for client-side security in e-commerce environments. It also addresses the threat of Magecart attacks and general client-side security best practices.

## PCI DSS Requirement 6.4.3: Management of Payment Page Scripts

### Intent:
Requirement 6.4.3 aims to prevent e-skimming attacks by ensuring that all scripts loaded and executed on payment pages are properly managed. This includes authorization, integrity assurance, and maintaining an inventory of scripts with business or technical justification.

### Key Elements:
*   **Authorization:** A method must be implemented to confirm that each script is authorized. This can be manual or automated and should occur before a script is added or changed, or as soon as possible after a change.
*   **Integrity:** A method must be implemented to assure the integrity of each script, ensuring they do not contain unauthorized or malicious content. This applies to new and updated scripts. Examples of approaches include Content Security Policy (CSP) and Sub-Resource Integrity (SRI).
*   **Inventory and Justification:** A comprehensive inventory of all scripts on the payment page must be maintained, along with a written business or technical justification for each script's necessity. This helps reduce the attack surface.

## PCI DSS Requirement 11.6.1: Detection and Alerting of Unauthorized Modifications

### Intent:
Requirement 11.6.1 focuses on detecting and responding to unauthorized changes to security-impacting HTTP headers and script contents of payment pages. It recognizes that unauthorized changes can occur and emphasizes timely detection and alerting to enable prompt corrective actions.

### Key Elements:
*   **Change- and Tamper-Detection Mechanism:** A mechanism must be deployed to alert personnel to unauthorized modifications (including indicators of compromise, changes, additions, and deletions) to security-impacting HTTP headers and script contents of payment pages as received by the consumer browser.
*   **Evaluation:** The mechanism must be configured to evaluate the received HTTP headers and payment pages.
*   **Frequency:** The mechanism's functions must be performed at least weekly, or at a frequency defined in the entity's targeted risk analysis (TRA) according to Requirement 12.3.1. Real-time monitoring is recommended where feasible.

### What May Indicate an Unauthorized Modification?
*   **Newly appears:** A new header or script is introduced.
*   **Is changed:** An existing header or script is altered or changes behavior from the previously authorized state.
*   **Is deleted:** A header or defensive script is removed.

## Magecart Skimmer Attacks

Magecart refers to several hacker groups that employ online skimming techniques to steal personal data from websites, particularly e-commerce sites. These attacks involve injecting malicious JavaScript code into checkout pages to skim payment card data. They can operate silently in the background (silent skimming) or by prompting consumers to enter card information twice (double-entry skimming).

## Client-Side Security Best Practices for E-commerce

The document highlights several controls and techniques to help meet PCI DSS Requirements 6.4.3 and 11.6.1 and minimize risk from client-side attacks:

### Controls and Techniques:
*   **Content Security Policy (CSP):** A native browser feature that allows web applications to set policies dictating how content is loaded and executed. It can limit script sources and define acceptable iframe origins. CSP can be paired with the HTTP Reporting API to capture policy violations.
*   **Sub-resource Integrity (SRI):** Helps confirm that retrieved resources (like scripts) have not been tampered with by comparing a hash in the HTML tag to the resource the browser loads. If there's a mismatch, the resource is blocked.
*   **Webpage Monitoring:** Approaches that examine a payment page as it is to be rendered in the consumer's browser (or a synthetic environment) to detect malicious or unexpected script activities. This can be agent-based (monitoring script injected into the page) or agentless (process or service navigates checkout flows).
*   **Proxy-based Solutions:** Intercept traffic at a reverse proxy or CDN edge, allowing for modification or analysis of HTML and scripts before they reach the consumer's browser. Can monitor static and dynamic script references, enforce policies, and block unauthorized content.

### Techniques Used with Controls:
*   **File Hashing:** Computing a cryptographic hash for a script and verifying it remains unchanged. Feasible for static scripts.
*   **Limiting Sources by URL:** Used in CSP and other controls to allow-list specific domains.
*   **Nonces:** Unique tokens inserted into script tags and CSP headers to authorize scripts. Detects unauthorized scripts but not internal changes within authorized scripts.
*   **Integrating Script Inventory into the Development Lifecycle:** Automating tracking and updating authorized script lists within CI/CD pipelines.
*   **Manual Processes:** Manual reviews, sign-offs, or regular website content analysis can complement automated controls.
*   **Behavior Monitoring:** Checks real-world actions of scripts (e.g., capturing keystrokes, modifying payment fields, sending data to unknown URLs) and triggers alerts/blocks if behavior deviates from authorized profile.
*   **Static Analysis Script Monitoring:** Periodically scanning collected scripts for known indicators of skimming or malicious code patterns.
*   **Tamper-Resistant Scripts:** Using compiler tools to transform scripts to detect or prevent malicious modifications.

## Applicability and Responsibilities

Requirements 6.4.3 and 11.6.1 apply differently based on the payment solution implementation (e.g., merchant-hosted, embedded iframes, redirection mechanisms, fully outsourced). Merchants retain responsibility for scripts on their webpages, even when using TPSPs. TPSPs also have responsibilities for scripts they provide.

## Conclusion

Meeting PCI DSS 6.4.3 and 11.6.1 requires a multi-faceted approach combining authorization, integrity checks, comprehensive inventory management, and robust change/tamper detection mechanisms. Leveraging a combination of technical controls like CSP, SRI, and various monitoring techniques, along with integrating security into the development lifecycle, is crucial for protecting e-commerce payment pages from client-side attacks like Magecart.

