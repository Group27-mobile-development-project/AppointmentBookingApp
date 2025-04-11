import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.ab27.R
import com.google.firebase.auth.FirebaseAuth

class HomeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        val user = FirebaseAuth.getInstance().currentUser
        val welcomeText = findViewById<TextView>(R.id.welcome_text)
        welcomeText.text = "Chào mừng, ${user?.displayName}!"
    }
}
