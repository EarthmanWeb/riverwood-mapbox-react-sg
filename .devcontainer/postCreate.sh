
#!/bin/sh

echo "Installing dependencies..."
pnpm install

echo "Setting up git config..."
git config --global pull.rebase false
git config --global user.email "terran@earthman.ca"
git config --global user.name "Earthman Media"
git config --global core.fileMode false


# persist bash history
SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/workspaces/$(echo $RepositoryName)/.bash_history" \
    && touch /workspaces/$(echo $RepositoryName)/.bash_history \
    && chown -R node  /workspaces/$(echo $RepositoryName)/.bash_history \
    && echo "$SNIPPET" >> "/home/node/.bashrc"
    
# Add ssh key for persistent SFTP connections to dev server

# create folder if not exists
[ ! -d /home/node/.ssh ] && sudo mkdir /home/node/.ssh
# Remove existing keys if present
sudo chmod 777 /home/node/.ssh
if [ -z "${SSH_KEY:-}" ]; then 
    sudo rm -f /home/node/.ssh/id_rsa*
    echo "Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f /home/node/.ssh/id_rsa -N "" -q || {
        echo "Failed to generate SSH key"
        exit 1
    }
    # Store key in base64 format
    SSH_KEY=$(cat /home/node/.ssh/id_rsa | base64 -w 0)
    NEWKEY=true
    echo "SSH key generated successfully"
else
    # Decode the existing key from base64
    echo "$SSH_KEY" | base64 -d > /home/node/.ssh/id_rsa
fi
sudo chmod 700 /home/node/.ssh
# only remove ~/.ssh/id_rsa.pub if exists
[ -f ~/.ssh/id_rsa.pub ] && sudo rm ~/.ssh/id_rsa.pub
sudo ssh-keygen -f /home/node/.ssh/id_rsa -y  | sudo tee /home/node/.ssh/id_rsa.pub >/dev/null
sudo chmod 600 /home/node/.ssh/id_rsa
sudo chmod 644 /home/node/.ssh/id_rsa.pub
sudo touch /home/node/.ssh/known_hosts
sudo chown node:node /home/node/.ssh/known_hosts
sudo chown -R node:node /home/node/.ssh
sudo chmod 755 /home/node/.ssh 
if [ -n "${NEWKEY:-}" ]; then
    echo
    echo
    echo -e "\e[31m"
    echo "No SSH key provided in Secrets. Add the private key below to your Github repo > Settings > Secrets & Variables > Codespaces with Name: SSH_KEY"
    echo -e "\e[0m"
    echo
    echo "$SSH_KEY"  # This will output the base64 encoded key
    echo
    echo
    echo
fi
echo -e "\e[32mAdd the following public key to your Remote Dev server for SFTP access: \e[0m"
echo
echo
echo $(cat /home/node/.ssh/id_rsa.pub | tr -d '\n' | tr -d '\r') 
echo 
echo

echo "Setup complete!"