# Use an official Python runtime as a parent image
FROM python:3.9

# Create a non-root user
RUN useradd -m -u 1000 user
USER user

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory
WORKDIR $HOME/app

# Copy requirements and install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY --chown=user . .

# Expose port 7860 (Hugging Face requirement)
EXPOSE 7860

# Run the application using gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:7860", "app:app"]
