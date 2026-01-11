#!/usr/bin/env python3
"""
Amazon KDP Upload Automation Tool
Per la pubblicazione automatica su Amazon Kindle Direct Publishing
"""

import os
import sys
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class KDPPublisher:
    def __init__(self):
        self.driver = None
        self.wait = None
        
    def setup_driver(self):
        """Configura Chrome driver per KDP"""
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_argument("--user-data-dir=/tmp/kdp_chrome_profile")
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 20)
        
    def login(self, email, password):
        """Login su KDP"""
        self.driver.get("https://kdp.amazon.com/dashboard")
        
        # Inserisci email
        email_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "ap_email"))
        )
        email_field.send_keys(email)
        
        # Inserisci password
        password_field = self.driver.find_element(By.ID, "ap_password")
        password_field.send_keys(password)
        
        # Click sign in
        sign_in_btn = self.driver.find_element(By.ID, "signInSubmit")
        sign_in_btn.click()
        
        # Attendi dashboard
        self.wait.until(
            EC.url_contains("dashboard")
        )
        
    def create_new_title(self, title, author):
        """Crea nuovo titolo"""
        # Click Create button
        create_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create')]"))
        )
        create_btn.click()
        
        # Kindle eBook
        kindle_radio = self.wait.until(
            EC.element_to_be_clickable((By.ID, "digital-text"))
        )
        kindle_radio.click()
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
        # Dettagli libro
        title_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "title-input"))
        )
        title_field.send_keys(title)
        
        author_field = self.driver.find_element(By.ID, "author-input")
        author_field.send_keys(author)
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def upload_epub(self, epub_path):
        """Carica file EPUB"""
        # Upload EPUB
        epub_upload = self.wait.until(
            EC.presence_of_element_located((By.ID, "epub-upload"))
        )
        
        epub_upload.send_keys(os.path.abspath(epub_path))
        
        # Attendi upload completato
        time.sleep(5)
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def upload_cover(self, cover_path):
        """Carica copertina"""
        # Upload copertina
        cover_upload = self.wait.until(
            EC.presence_of_element_located((By.ID, "cover-upload"))
        )
        
        cover_upload.send_keys(os.path.abspath(cover_path))
        
        # Attendi upload completato
        time.sleep(5)
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def set_pricing(self, price, royalty=70):
        """Imposta prezzo e royalty"""
        # Prezzo
        price_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "price-input"))
        )
        price_field.clear()
        price_field.send_keys(str(price))
        
        # Royalty
        royalty_field = self.driver.find_element(By.ID, "royalty-option")
        royalty_field.click()
        
        # Seleziona royalty
        if royalty == 70:
            royalty_70 = self.driver.find_element(By.XPATH, "//option[@value='70']")
            royalty_70.click()
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def set_categories(self, categories):
        """Imposta categorie"""
        # Categoria principale
        category_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "category-select"))
        )
        
        for category in categories:
            category_field.send_keys(category)
            time.sleep(1)
            category_field.send_keys("\n")
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def set_keywords(self, keywords):
        """Imposta keywords"""
        keywords_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "keywords-input"))
        )
        
        keywords_field.send_keys(", ".join(keywords))
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def set_territories(self, territories):
        """Imposta territori"""
        # Seleziona tutti i territori
        all_territories = self.wait.until(
            EC.presence_of_element_located((By.ID, "all-territories"))
        )
        all_territories.click()
        
        continue_btn = self.driver.find_element(By.ID, "continue-button")
        continue_btn.click()
        
    def preview_and_publish(self):
        """Anteprima e pubblicazione"""
        # Anteprima
        preview_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "preview-button"))
        )
        preview_btn.click()
        
        # Attenti anteprima
        time.sleep(3)
        
        # Pubblica
        publish_btn = self.driver.find_element(By.ID, "publish-button")
        publish_btn.click()
        
        # Conferma pubblicazione
        confirm_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "confirm-publish"))
        )
        confirm_btn.click()
        
    def publish_book(self, book_data):
        """Pubblica libro completo"""
        try:
            self.setup_driver()
            
            # Login
            self.login(book_data['email'], book_data['password'])
            
            # Crea titolo
            self.create_new_title(book_data['title'], book_data['author'])
            
            # Carica EPUB
            self.upload_epub(book_data['epub_path'])
            
            # Carica copertina
            self.upload_cover(book_data['cover_path'])
            
            # Imposta prezzo
            self.set_pricing(book_data['price'], book_data['royalty'])
            
            # Imposta categorie
            self.set_categories(book_data['categories'])
            
            # Imposta keywords
            self.set_keywords(book_data['keywords'])
            
            # Imposta territori
            self.set_territories(book_data['territories'])
            
            # Pubblica
            self.preview_and_publish()
            
            print(f"✅ Libro '{book_data['title']}' pubblicato con successo!")
            
        except Exception as e:
            print(f"❌ Errore durante la pubblicazione: {e}")
            
        finally:
            if self.driver:
                self.driver.quit()

def main():
    """Funzione principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Pubblica libro su Amazon KDP')
    parser.add_argument('--epub', required=True, help='Percorso file EPUB')
    parser.add_argument('--cover', required=True, help='Percorso file copertina')
    parser.add_argument('--title', required=True, help='Titolo libro')
    parser.add_argument('--author', required=True, help='Autore libro')
    parser.add_argument('--price', type=float, default=2.99, help='Prezzo libro')
    parser.add_argument('--royalty', type=int, default=70, help='Royalty percentuale')
    parser.add_argument('--email', help='Email KDP')
    parser.add_argument('--password', help='Password KDP')
    
    args = parser.parse_args()
    
    # Dati libro
    book_data = {
        'epub_path': args.epub,
        'cover_path': args.cover,
        'title': args.title,
        'author': args.author,
        'price': args.price,
        'royalty': args.royalty,
        'categories': ['Fiction', 'Literature'],  # Default
        'keywords': ['classic', 'literature', 'philosophy'],
        'territories': ['all'],
        'email': args.email or os.getenv('KDP_EMAIL'),
        'password': args.password or os.getenv('KDP_PASSWORD')
    }
    
    # Verifica credenziali
    if not book_data['email'] or not book_data['password']:
        print("❌ Email e password KDP richiesti!")
        print("Impostale con --email e --password o variabili d'ambiente KDP_EMAIL e KDP_PASSWORD")
        sys.exit(1)
    
    # Pubblica
    publisher = KDPPublisher()
    publisher.publish_book(book_data)

if __name__ == "__main__":
    main()
