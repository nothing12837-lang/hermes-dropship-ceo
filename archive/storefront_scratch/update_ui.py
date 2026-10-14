import re
path = 'src/app/checkout/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('const data = await res.json();\n      if (data.url) {\n        clear();\n        window.location.href = data.url;\n      } else if (data.mock) {\n        // No Stripe keys', 'const data = await res.json();\n      if (data.mock) {\n        // No keys')

c = c.replace('} else {\n        setError(data.error || \'Checkout failed. Try again.\');\n      }', '} else if (data.error) {\n        setError(data.error);\n        setLoading(false);\n        return;\n      } else {\n        const options = {\n          key: data.key_id,\n          amount: data.amount,\n          currency: data.currency,\n          name: \"RareEmber\",\n          description: \"Store Purchase\",\n          order_id: data.order_id,\n          handler: function (response: any) {\n            clear();\n            window.location.href = /success?session_id=;\n          },\n          prefill: { name: name, email: email },\n          theme: { color: \"#ff6b35\" }\n        };\n        const rzp = new (window as any).Razorpay(options);\n        rzp.on(\"payment.failed\", function (response: any) {\n          setError(\"Payment Failed. \" + response.error.description);\n        });\n        rzp.open();\n      }')

c = c.replace('// Save email for CartDrawer\n    localStorage.setItem(\'rareember_email\', email);\n    setLoading(true);', '// Save email for CartDrawer\n    localStorage.setItem(\'rareember_email\', email);\n    setLoading(true);\n    if (!(window as any).Razorpay) {\n      await new Promise((resolve) => {\n        const script = document.createElement(\'script\');\n        script.src = \'https://checkout.razorpay.com/v1/checkout.js\';\n        script.onload = resolve;\n        document.body.appendChild(script);\n      });\n    }')

c = c.replace('Opening Stripe', 'Opening Razorpay')
c = c.replace('Secure Stripe checkout', 'Secure Razorpay checkout')
c = c.replace('Stripe to pay with card, Apple Pay or Google Pay', 'Razorpay to pay with UPI, Card, or Netbanking')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Done!')
